package com.iot.smart_room.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeviceRequest {
    private String name;
    private Integer page;
    private Integer size;
    private String sortType = "desc";
}
