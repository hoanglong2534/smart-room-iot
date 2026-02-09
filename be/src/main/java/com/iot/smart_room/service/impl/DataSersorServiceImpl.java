package com.iot.smart_room.service.impl;

import com.iot.smart_room.dto.request.DataSensorRequest;
import com.iot.smart_room.dto.response.DataSensorResponse;
import com.iot.smart_room.entity.DataSensorEntity;
import com.iot.smart_room.mapper.DataSersorMapper;
import com.iot.smart_room.repo.DataSensorRepository;
import com.iot.smart_room.service.DataSensorService;
import com.iot.smart_room.service.specification.DataSensorSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DataSersorServiceImpl implements DataSensorService {

    private final DataSensorRepository dataSensorRepository;
    private final DataSensorSpecification dataSensorSpecification;
    private final DataSersorMapper dataSersorMapper;

    @Override
    public Page<DataSensorResponse> search(DataSensorRequest dataSensorRequest) {

        Integer page = dataSensorRequest.getPage() != null ? dataSensorRequest.getPage() : 0;
        Integer size = dataSensorRequest.getSize() != null ? dataSensorRequest.getSize() : 15;

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.fromString(dataSensorRequest.getSortType() != null ? dataSensorRequest.getSortType() : "DESC"), "createdAt")
        );

        Page<DataSensorEntity> entityPage = dataSensorRepository.findAll(dataSensorSpecification.search(dataSensorRequest), pageable);

        return entityPage.map(dataSersorMapper::toResponse);
    }

}
