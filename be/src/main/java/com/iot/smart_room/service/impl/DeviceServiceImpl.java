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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {

    private final DeviceRepository deviceRepository;
    private final ActionHistoryRepository actionHistoryRepository;
    private final DeviceMapper deviceMapper;

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
        Long deviceId = Long.parseLong(request.getDeviceId());
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
        }
    }

    @Override
    public Set<String> getAllNames() {
        return deviceRepository.getAllName();
    }
}
