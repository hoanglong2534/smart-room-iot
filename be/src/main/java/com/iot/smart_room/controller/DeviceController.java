package com.iot.smart_room.controller;

import com.iot.smart_room.dto.request.DeviceControlRequest;
import com.iot.smart_room.dto.request.DeviceRequest;
import com.iot.smart_room.dto.response.DeviceResponse;
import com.iot.smart_room.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/smartroom/api/device")
@CrossOrigin(origins = "*")
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping
    public Page<DeviceResponse> getAllDevices(@ModelAttribute DeviceRequest request) {
        return deviceService.getAllDevices(request);
    }

    @PostMapping("/control")
    public Map<String, String> controlDevice(@RequestBody DeviceControlRequest request) throws Exception {
        deviceService.controlDevice(request);
        return Map.of("message", "Control signal sent successfully");
    }
}
