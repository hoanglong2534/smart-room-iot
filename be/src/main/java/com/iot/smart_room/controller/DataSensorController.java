package com.iot.smart_room.controller;

import com.iot.smart_room.dto.request.DataSensorRequest;
import com.iot.smart_room.dto.response.DataSensorResponse;
import com.iot.smart_room.service.DataSensorService;
import com.iot.smart_room.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Set;


@RestController
@RequiredArgsConstructor
@RequestMapping("/smartroom/api/sensors")
@CrossOrigin(origins = "*")
public class DataSensorController {

    private final DataSensorService dataSensorService;
    private final SensorService sensorService;

    @GetMapping("")
    public Page<DataSensorResponse> getDataSensors(@ModelAttribute DataSensorRequest dataSensorRequest){
        return dataSensorService.search(dataSensorRequest);
    }

    @GetMapping("/names")
    public Set<String> getSensorsList() {
        return sensorService.getSensorNames();
    }
}
