package com.iot.smart_room.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iot.smart_room.entity.ActionHistoryEntity;
import com.iot.smart_room.entity.DataSensorEntity;
import com.iot.smart_room.entity.DeviceEntity;
import com.iot.smart_room.entity.SensorEntity;
import com.iot.smart_room.enums.ActionEnum;
import com.iot.smart_room.enums.StatusEnum;
import com.iot.smart_room.repo.ActionHistoryRepository;
import com.iot.smart_room.repo.DataSensorRepository;
import com.iot.smart_room.repo.DeviceRepository;
import com.iot.smart_room.repo.SensorRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class MqttUtils {

    private final DataSensorRepository dataSensorRepository;
    private final ActionHistoryRepository actionHistoryRepository;
    private final SensorRepository sensorRepository;
    private final DeviceRepository deviceRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public void processSensorData(String payload) {
        try {
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            saveSensor("Nhiệt độ", data.get("temperature"));
            saveSensor("Độ ẩm", data.get("humidity"));
            saveSensor("Ánh sáng", data.get("light"));

            messagingTemplate.convertAndSend("/topic/sensors", (Object) data);
        } catch (Exception e) {
            try {
                java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter("/tmp/mqtt_log.txt", true));
                pw.println("Error processing sensor data: " + e.getMessage());
                e.printStackTrace(pw);
                pw.close();
            } catch (Exception ex) {}
            log.error("Error processing sensor data", e);
        }
    }

    private void saveSensor(String name, Object valueObj) {
        if (valueObj == null) return;

        SensorEntity sensor = sensorRepository.findByName(name)
                .orElseGet(() -> {
                    SensorEntity s = new SensorEntity();
                    s.setName(name);
                    s.setCreated_at(LocalDateTime.now());
                    return sensorRepository.save(s);
                });

        DataSensorEntity entity = new DataSensorEntity();
        entity.setSensor(sensor);

        double value = 0;
        if (valueObj instanceof Number) {
            value = ((Number) valueObj).doubleValue();
        }
        entity.setValue(value);
        entity.setCreatedAt(LocalDateTime.now());

        dataSensorRepository.save(entity);
    }

    @Transactional
    public void processDeviceStatus(String topic, String payload) {
        try {
            System.out.println("=== MQTT STATUS RECEIVED ===");
            System.out.println("Topic: " + topic);
            System.out.println("Payload: " + payload);
            
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            String statusStr = (String) data.get("status");
            if (statusStr == null) {
                System.out.println("Status is null, ignoring");
                return;
            }

            System.out.println("Processing status update: topic=" + topic + ", payload=" + payload);
            Long deviceId = resolveDeviceId(data, topic);
            System.out.println("Resolved deviceId: " + deviceId);
            
            if (deviceId == null) {
                System.out.println("FAILED to resolve deviceId");
                return;
            }
            
            deviceRepository.updateStatus(deviceId, statusStr);
            System.out.println("Updated device status in DB");
            
            actionHistoryRepository.findFirstByDeviceIdAndStatusOrderByCreatedAtDesc(deviceId, StatusEnum.PENDING)
                .ifPresentOrElse(history -> {
                    try {
                        String normalizedStatus = statusStr.trim().toUpperCase();
                        System.out.println("Found PENDING history ID " + history.getId() + ", updating to " + normalizedStatus);
                        history.setStatus(StatusEnum.valueOf(normalizedStatus));
                        history.setAction("ON".equals(normalizedStatus) ? ActionEnum.ON : ActionEnum.OFF);
                        actionHistoryRepository.save(history);
                        System.out.println("UPDATED ActionHistory ID " + history.getId() + " to " + normalizedStatus);
                    } catch (Exception e) {
                        System.out.println("ERROR updating history: " + e.getMessage());
                        e.printStackTrace();
                    }
                }, () -> {
                    System.out.println("NO PENDING record for device " + deviceId);
                    // Fallback: create history if none found
                    deviceRepository.findById(deviceId).ifPresent(d -> createHistory(d, statusStr));
                });

            messagingTemplate.convertAndSend("/topic/device-status", (Object) data);
        } catch (Exception e) {
            System.out.println("Error processing device status: " + e.getMessage());
            e.printStackTrace();
            log.error("Error processing device status: topic={}, payload={}", topic, payload, e);
        }
    }

    /** Prefer numeric deviceId from JSON; fallback topic segment */
    private Long resolveDeviceId(Map<String, Object> data, String topic) {
        Object raw = data.get("deviceId");
        if (raw != null) {
            String idStr = raw.toString().trim();
            // Remove "fan", "light", etc and map to numeric if needed, 
            // but the current ESP32 code uses String(pendingActionDeviceId) which is "1","2","3"
            try {
                if (raw instanceof Number) return ((Number) raw).longValue();
                return Long.parseLong(idStr);
            } catch (NumberFormatException ignored) {
                // Mappings if the circuit sends text names
                if ("fan".equalsIgnoreCase(idStr)) return 1L;
                if ("light".equalsIgnoreCase(idStr)) return 2L;
                if ("humidifier".equalsIgnoreCase(idStr)) return 3L;
            }
        }
        try {
            return Long.parseLong(topic.substring(topic.lastIndexOf("/") + 1));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private void createHistory(DeviceEntity device, String statusStr) {
        ActionHistoryEntity history = new ActionHistoryEntity();
        history.setDevice(device);
        try {
            history.setStatus(StatusEnum.valueOf(statusStr));
            if ("ON".equals(statusStr)) history.setAction(ActionEnum.ON);
            if ("OFF".equals(statusStr)) history.setAction(ActionEnum.OFF);
        } catch (Exception ignored) {}
        history.setCreatedAt(LocalDateTime.now());
        actionHistoryRepository.save(history);
    }
}
