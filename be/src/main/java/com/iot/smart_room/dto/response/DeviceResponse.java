package com.iot.smart_room.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeviceResponse {
    private Long id;
    private String name;
    private String currentStatus;
    private String state;
    private LocalDateTime createdAt;
}
