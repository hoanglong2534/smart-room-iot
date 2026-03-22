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
    private String sensorName;
    private Long sensorId;
    private Double value;
    @org.springframework.format.annotation.DateTimeFormat(pattern = "HH:mm:ss dd-MM-yyyy")
    private LocalDateTime from;
    @org.springframework.format.annotation.DateTimeFormat(pattern = "HH:mm:ss dd-MM-yyyy")
    private LocalDateTime to;

    private Integer page;
    private Integer size;
    private String sortType = "desc";
}
