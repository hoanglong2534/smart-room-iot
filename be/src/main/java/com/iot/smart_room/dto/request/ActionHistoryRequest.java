package com.iot.smart_room.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActionHistoryRequest {
    private String deviceId;
    private String deviceName;
    private String action;
    private String status;
    @org.springframework.format.annotation.DateTimeFormat(pattern = "HH:mm:ss dd-MM-yyyy")
    private LocalDateTime time;

    private Integer page;
    private Integer size;
    private String sortType = "desc";
}
