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
            saveSensor("Temperature", data.get("temperature"));
            saveSensor("Humidity", data.get("humidity"));
            saveSensor("Light", data.get("light"));

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

        long value = 0;
        if (valueObj instanceof Number) {
            value = ((Number) valueObj).longValue();
        }
        entity.setValue(value);
        entity.setCreatedAt(LocalDateTime.now());

        dataSensorRepository.save(entity);
    }

    public void processDeviceStatus(String topic, String payload) {
        try {
            Long deviceId = Long.parseLong(topic.substring(topic.lastIndexOf("/") + 1));
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            String statusStr = (String) data.get("status");

            deviceRepository.findById(deviceId).ifPresent(device -> {
                device.setCurrent_status(statusStr);
                deviceRepository.save(device);

                createHistory(device, statusStr);
                
                messagingTemplate.convertAndSend("/topic/device-status", (Object) data);
            });
        } catch (Exception e) {
            log.error("Error processing device status", e);
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
