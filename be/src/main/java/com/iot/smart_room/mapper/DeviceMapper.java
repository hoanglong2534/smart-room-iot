package com.iot.smart_room.mapper;

import com.iot.smart_room.dto.response.DeviceResponse;
import com.iot.smart_room.entity.DeviceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface DeviceMapper {

    @Mapping(target = "id", source = "id", qualifiedByName = "formatId")
    @Mapping(source = "current_status", target = "currentStatus")
    @Mapping(source = "created_at", target = "createdAt")
    DeviceResponse toResponse(DeviceEntity entity);

    @Named("formatId")
    default String formatId(Long id) {
        if (id == null) {
            return null;
        }
        return String.format("DEV%03d", id);
    }
}
