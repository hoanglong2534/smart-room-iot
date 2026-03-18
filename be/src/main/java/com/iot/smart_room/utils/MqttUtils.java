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
import jakarta.transaction.Transactional;
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
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            String statusStr = (String) data.get("status");
            if (statusStr == null) return;

            Long deviceId = resolveDeviceId(data, topic);
            if (deviceId == null) return;

            // Direct update - bypass JPA entity cache issues
            int updated = deviceRepository.updateStatus(deviceId, statusStr);
            log.info("Updated device {} status to {} (rows: {})", deviceId, statusStr, updated);

            if (updated > 0) {
                deviceRepository.findById(deviceId).ifPresent(device -> {
                    ActionHistoryEntity history = new ActionHistoryEntity();
                    history.setDevice(device);
                    history.setCreatedAt(LocalDateTime.now());
                    try {
                        history.setStatus(StatusEnum.valueOf(statusStr));
                        if ("ON".equals(statusStr)) history.setAction(ActionEnum.ON);
                        if ("OFF".equals(statusStr)) history.setAction(ActionEnum.OFF);
                    } catch (Exception ignored) {}
                    actionHistoryRepository.save(history);
                });

                messagingTemplate.convertAndSend("/topic/device-status", (Object) data);
            }
        } catch (Exception e) {
            log.error("Error processing device status: topic={}, payload={}", topic, payload, e);
        }
    }

    /** Prefer numeric deviceId from JSON (ESP gửi "1","2","3"); fallback topic segment */
    private Long resolveDeviceId(Map<String, Object> data, String topic) {
        Object raw = data.get("deviceId");
        if (raw != null) {
            try {
                if (raw instanceof Number) return ((Number) raw).longValue();
                return Long.parseLong(raw.toString().trim());
            } catch (NumberFormatException ignored) {
            }
        }
        try {
            return Long.parseLong(topic.substring(topic.lastIndexOf("/") + 1));
        } catch (NumberFormatException e) {
            log.warn("Cannot resolve device id from topic={} payload deviceId={}", topic, raw);
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
