package com.iot.smart_room.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DataSensorRequest {
    private String name;
    private Long value;
    private LocalDateTime from;
    private LocalDateTime to;

    private Integer page;
    private Integer size;
    private String sortType = "desc";
}
