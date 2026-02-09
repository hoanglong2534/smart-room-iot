package com.iot.smart_room.service;

import com.iot.smart_room.dto.request.DataSensorRequest;
import com.iot.smart_room.dto.response.DataSensorResponse;
import org.springframework.data.domain.Page;

public interface DataSensorService {

    Page<DataSensorResponse> search(DataSensorRequest dataSensorRequest);
}
