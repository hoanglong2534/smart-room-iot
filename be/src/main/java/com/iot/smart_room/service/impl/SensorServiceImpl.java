package com.iot.smart_room.service.impl;

import com.iot.smart_room.dto.response.SensorResponse;
import com.iot.smart_room.entity.SensorEntity;
import com.iot.smart_room.repo.SensorRepository;
import com.iot.smart_room.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SensorServiceImpl implements SensorService {

    private final SensorRepository sensorRepository;

    @Override
    public List<SensorResponse> getAllSensors() {
        return sensorRepository.findAll().stream()
                .map(entity -> SensorResponse.builder()
                        .id(entity.getId())
                        .name(entity.getName())
                        .build())
                .collect(Collectors.toList());
    }
}
