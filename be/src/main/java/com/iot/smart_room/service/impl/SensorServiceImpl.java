package com.iot.smart_room.service.impl;

import com.iot.smart_room.repo.SensorRepository;
import com.iot.smart_room.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class SensorServiceImpl implements SensorService  {

    private final SensorRepository sensorRepository;

    @Override
    public Set<String> getSensorNames() {
        Set<String> se = sensorRepository.getAllName();
        return se;
    }
}
