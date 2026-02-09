package com.iot.smart_room.dto.response;

import com.iot.smart_room.enums.ActionEnum;
import com.iot.smart_room.enums.StatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActionHistoryResponse {
    private String id;
    private String deviceName;
    private ActionEnum action;
    private StatusEnum status;
    private LocalDateTime time;
}
