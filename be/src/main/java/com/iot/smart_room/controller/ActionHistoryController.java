package com.iot.smart_room.controller;

import com.iot.smart_room.dto.request.ActionHistoryRequest;
import com.iot.smart_room.dto.response.ActionHistoryResponse;
import com.iot.smart_room.service.ActionHistoryService;
import com.iot.smart_room.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/smartroom/api/action-histories")
@CrossOrigin(origins = "*")
public class ActionHistoryController {

    private final ActionHistoryService actionHistoryService;
    private final DeviceService deviceService;

    @GetMapping("")
    public Page<ActionHistoryResponse> search(@ModelAttribute ActionHistoryRequest request){
        return actionHistoryService.search(request);
    }

    @GetMapping("/names")
    public Set<String> getNames(){
        return deviceService.getAllNames();
    }
}
