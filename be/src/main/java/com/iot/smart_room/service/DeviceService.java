package com.iot.smart_room.service;

import com.iot.smart_room.dto.request.DeviceControlRequest;
import com.iot.smart_room.dto.request.DeviceRequest;
import com.iot.smart_room.dto.response.DeviceResponse;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Set;

public interface DeviceService {
    Page<DeviceResponse> getAllDevices(DeviceRequest request);
    void controlDevice(DeviceControlRequest request) throws Exception;

    Set<String> getAllNames();
}
