package com.iot.smart_room.mapper;

import com.iot.smart_room.dto.response.DeviceResponse;
import com.iot.smart_room.entity.DeviceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface DeviceMapper {

    @Mapping(source = "current_status", target = "currentStatus")
    @Mapping(source = "created_at", target = "createdAt")
    DeviceResponse toResponse(DeviceEntity entity);
}
