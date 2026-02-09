package com.iot.smart_room.controller;

import com.iot.smart_room.dto.request.DataSensorRequest;
import com.iot.smart_room.dto.response.DataSensorResponse;
import com.iot.smart_room.service.DataSensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/smartroom/api/sensors")
@CrossOrigin(origins = "*")
public class DataSensorController {

    private final DataSensorService dataSensorService;

    @GetMapping("")
    public Page<DataSensorResponse> getDataSersors(@ModelAttribute DataSensorRequest dataSensorRequest){
        return dataSensorService.search(dataSensorRequest);
    }
}
