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

import com.iot.smart_room.config.MqttGateway;
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
    private final MqttGateway mqttGateway;


    private static final java.util.Map<Long, java.time.LocalDateTime> manualGuards = new java.util.concurrent.ConcurrentHashMap<>();

    public static void markManualAction(Long deviceId) {
        manualGuards.put(deviceId, java.time.LocalDateTime.now());
    }

    @Transactional
    public void processSensorData(String payload) {
        try {
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);

            recordSensorValue("Nhiệt độ", data.get("temperature"));
            recordSensorValue("Độ ẩm", data.get("humidity"));
            recordSensorValue("Ánh sáng", data.get("light"));

            double dustValue = extractOrSimulateDustValue(data);
            recordSensorValue("Độ bụi", dustValue);

            handleAutomatedControls(data);


            messagingTemplate.convertAndSend("/topic/sensors", (Object) data);

        } catch (Exception e) {
            log.error("Failed to process MQTT sensor payload: {}", payload, e);
        }
    }

    private double extractOrSimulateDustValue(Map<String, Object> data) {
        Object dustObj = data.get("dust");
        if (dustObj instanceof Number) {
            return ((Number) dustObj).doubleValue();
        }

        double simulatedDust = Math.round(Math.random() * 300);
        data.put("dust", simulatedDust);
        return simulatedDust;
    }

    private void recordSensorValue(String sensorName, Object valueObj) {
        if (valueObj == null)
            return;


        SensorEntity sensor = sensorRepository.findByName(sensorName)
                .orElseGet(() -> {
                    SensorEntity s = new SensorEntity();
                    s.setName(sensorName);
                    s.setCreatedAt(LocalDateTime.now());
                    return sensorRepository.save(s);
                });


        DataSensorEntity entry = new DataSensorEntity();
        entry.setSensor(sensor);
        entry.setValue(valueObj instanceof Number ? ((Number) valueObj).doubleValue() : 0);
        entry.setCreatedAt(LocalDateTime.now());

        dataSensorRepository.save(entry);
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
                            System.out.println("Found PENDING history ID " + history.getId() + ", updating to "
                                    + normalizedStatus);
                            history.setStatus(StatusEnum.valueOf(normalizedStatus));
                            history.setAction("ON".equals(normalizedStatus) ? ActionEnum.ON : ActionEnum.OFF);
                            actionHistoryRepository.save(history);
                            System.out
                                    .println("UPDATED ActionHistory ID " + history.getId() + " to " + normalizedStatus);
                        } catch (Exception e) {
                            System.out.println("ERROR updating history: " + e.getMessage());
                            e.printStackTrace();
                        }
                    }, () -> {
                        System.out.println("NO PENDING record for device " + deviceId);
                        deviceRepository.findById(deviceId).ifPresent(d -> createHistory(d, statusStr));
                    });

            messagingTemplate.convertAndSend("/topic/device-status", (Object) data);
        } catch (Exception e) {
            System.out.println("Error processing device status: " + e.getMessage());
            e.printStackTrace();
            log.error("Error processing device status: topic={}, payload={}", topic, payload, e);
        }
    }


    private Long resolveDeviceId(Map<String, Object> data, String topic) {
        Object raw = data.get("deviceId");
        if (raw != null) {
            String idStr = raw.toString().trim();

            try {
                if (raw instanceof Number)
                    return ((Number) raw).longValue();
                return Long.parseLong(idStr);
            } catch (NumberFormatException ignored) {
                if ("fan".equalsIgnoreCase(idStr))
                    return 1L;
                if ("light".equalsIgnoreCase(idStr))
                    return 2L;
                if ("humidifier".equalsIgnoreCase(idStr))
                    return 3L;
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
            if ("ON".equals(statusStr))
                history.setAction(ActionEnum.ON);
            if ("OFF".equals(statusStr))
                history.setAction(ActionEnum.OFF);
        } catch (Exception ignored) {
        }
        history.setCreatedAt(LocalDateTime.now());
        actionHistoryRepository.save(history);
    }

    private void handleAutomatedControls(Map<String, Object> data) {
        try {
            // 1. Dust Warning (Virtual + Hardware LED already handled in ESP32)
            double dust = ((Number) data.getOrDefault("dust", 0.0)).doubleValue();
            updateDeviceAutomation("Cảnh báo độ bụi", dust > 100);

            // 2. Fan (Temperature > 30)
            double temp = ((Number) data.getOrDefault("temperature", 0.0)).doubleValue();
            updateDeviceAutomation("Quạt", temp > 30);

            // 3. Humidifier (Humidity < 60)
            double hum = ((Number) data.getOrDefault("humidity", 0.0)).doubleValue();
            updateDeviceAutomation("Máy hút ẩm", hum < 60);

            // 4. Light (Light < 300)
            double lightValue = ((Number) data.getOrDefault("light", 0.0)).doubleValue();
            updateDeviceAutomation("Đèn", lightValue < 300);

        } catch (Exception e) {
            log.error("Error in automated controls: {}", e.getMessage(), e);
        }
    }

    private void updateDeviceAutomation(String deviceName, boolean shouldBeOn) {
        deviceRepository.findByName(deviceName).ifPresent(device -> {
            java.time.LocalDateTime lastManual = manualGuards.get(device.getId());
            if (lastManual != null && lastManual.plusSeconds(30).isAfter(java.time.LocalDateTime.now())) {
                return;
            }

            String newStatus = shouldBeOn ? "ON" : "OFF";
            if (!newStatus.equalsIgnoreCase(device.getCurrent_status())) {
                log.info("AUTOMATION: Toggling {} to {}", deviceName, newStatus);

                if (!deviceName.contains("Cảnh báo")) {
                    String controlTopic = "smartroom/control/device/" + device.getId();
                    String controlPayload = String.format("{\"deviceId\":\"%s\", \"action\":\"%s\"}",
                            device.getId().toString(), newStatus);
                    mqttGateway.sendToMqtt(controlTopic, controlPayload);
                }

                device.setCurrent_status(newStatus);
                device.setState(newStatus);
                deviceRepository.save(device);

                ActionHistoryEntity history = new ActionHistoryEntity();
                history.setDevice(device);
                history.setAction(shouldBeOn ? ActionEnum.ON : ActionEnum.OFF);
                history.setStatus(shouldBeOn ? StatusEnum.ON : StatusEnum.OFF);
                history.setCreatedAt(LocalDateTime.now());
                actionHistoryRepository.save(history);

                messagingTemplate.convertAndSend("/topic/device-status", (Object) Map.of(
                        "deviceId", device.getId(),
                        "status", newStatus));
            }
        });
    }

    private void handleDustWarningAutomation(boolean isWarning) {

        updateDeviceAutomation("Cảnh báo độ bụi", isWarning);
    }
}
