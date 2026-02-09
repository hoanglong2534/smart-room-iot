package com.iot.smart_room.service;

import com.iot.smart_room.dto.request.ActionHistoryRequest;
import com.iot.smart_room.dto.response.ActionHistoryResponse;
import org.springframework.data.domain.Page;

public interface ActionHistoryService {
    Page<ActionHistoryResponse> search(ActionHistoryRequest request);
}
