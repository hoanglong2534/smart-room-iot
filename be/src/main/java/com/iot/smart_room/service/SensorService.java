package com.iot.smart_room.service;

import com.iot.smart_room.dto.response.SensorResponse;

import java.util.List;

public interface SensorService {
    List<SensorResponse> getAllSensors();
}
