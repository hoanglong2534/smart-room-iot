package com.iot.smart_room.mapper;

import com.iot.smart_room.dto.response.ActionHistoryResponse;
import com.iot.smart_room.entity.ActionHistoryEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ActionHistoryMapper {

    @Mapping(target = "id", source = "id", qualifiedByName = "formatId")
    @Mapping(source = "device.name", target = "deviceName")
    @Mapping(source = "action", target = "action")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "createdAt", target = "time")
    ActionHistoryResponse toResponse(ActionHistoryEntity entity);

    @Named("formatId")
    default String formatId(Long id) {
        if (id == null) {
            return null;
        }
        return String.format("ACT%03d", id);
    }
}
