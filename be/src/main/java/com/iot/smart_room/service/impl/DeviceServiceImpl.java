package com.iot.smart_room.service.impl;

import com.iot.smart_room.dto.request.DeviceControlRequest;
import com.iot.smart_room.dto.request.DeviceRequest;
import com.iot.smart_room.dto.response.DeviceResponse;
import com.iot.smart_room.entity.ActionHistoryEntity;
import com.iot.smart_room.entity.DeviceEntity;
import com.iot.smart_room.enums.ActionEnum;
import com.iot.smart_room.enums.StatusEnum;
import com.iot.smart_room.mapper.DeviceMapper;
import com.iot.smart_room.repo.ActionHistoryRepository;
import com.iot.smart_room.repo.DeviceRepository;
import com.iot.smart_room.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.iot.smart_room.config.MqttGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {

    private final DeviceRepository deviceRepository;
    private final ActionHistoryRepository actionHistoryRepository;
    private final DeviceMapper deviceMapper;
    private final MqttGateway mqttGateway;

    @Override
    public Page<DeviceResponse> getAllDevices(DeviceRequest request) {
        Integer page = request.getPage() != null ? request.getPage() : 0;
        Integer size = request.getSize() != null ? request.getSize() : 15;

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.fromString(request.getSortType() != null ? request.getSortType() : "DESC"), "id")
        );

        return deviceRepository.findAll(pageable).map(deviceMapper::toResponse);
    }

    @Override
    @Transactional
    public void controlDevice(DeviceControlRequest request) throws Exception {
        String reqDeviceId = request.getDeviceId();
        Long deviceId;
        if (reqDeviceId != null && reqDeviceId.startsWith("DEV")) {
            deviceId = Long.parseLong(reqDeviceId.substring(3));
        } else {
            deviceId = Long.parseLong(reqDeviceId);
        }
        String action = request.getAction();

        DeviceEntity device = deviceRepository.findById(deviceId).orElse(null);
        if (device != null) {
            ActionHistoryEntity history = new ActionHistoryEntity();
            history.setDevice(device);
            history.setStatus(StatusEnum.PENDING);
            if ("ON".equals(action)) history.setAction(ActionEnum.ON);
            if ("OFF".equals(action)) history.setAction(ActionEnum.OFF);
            history.setCreatedAt(LocalDateTime.now());
            actionHistoryRepository.save(history);

            final Long historyId = history.getId();
            final String expectedAction = action;
            CompletableFuture.runAsync(() -> {
                try {
                    Thread.sleep(1500);
                    actionHistoryRepository.findById(historyId).ifPresent(h -> {
                        if (h.getStatus() == StatusEnum.PENDING) {
                            String normalized = expectedAction == null ? "" : expectedAction.trim().toUpperCase();
                            if ("ON".equals(normalized)) {
                                h.setAction(ActionEnum.ON);
                                h.setStatus(StatusEnum.ON);
                            } else if ("OFF".equals(normalized)) {
                                h.setAction(ActionEnum.OFF);
                                h.setStatus(StatusEnum.OFF);
                            }
                            actionHistoryRepository.save(h);
                        }
                    });
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
            });

            // Giữ DB đồng bộ với lệnh gửi đi để GET /device trả đúng trạng thái (MQTT status có thể tới trễ hoặc lệch broker)
            device.setCurrent_status(action);
            deviceRepository.save(device);

            mqttGateway.sendToMqtt("smartroom/control/device/" + deviceId, "{\"deviceId\":\"" + deviceId + "\", \"action\":\"" + action + "\"}");
        }
    }

    @Override
    public Set<String> getAllNames() {
        return deviceRepository.getAllName();
    }
}
