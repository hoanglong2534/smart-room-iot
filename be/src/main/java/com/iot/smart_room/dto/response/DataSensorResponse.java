package com.iot.smart_room.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DataSensorResponse {
    private String id;
    private String name;
    private Long value;
    private LocalDateTime from;
    private LocalDateTime to;
}
