package com.iot.smart_room.mapper;

import com.iot.smart_room.dto.response.DataSensorResponse;
import com.iot.smart_room.entity.DataSensorEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface DataSersorMapper {

    @Mapping(target = "id", source = "id", qualifiedByName = "formatId")
    @Mapping(source = "sensor.name", target = "name")
    @Mapping(source = "createdAt", target = "from")
    @Mapping(source = "createdAt", target = "to")
    DataSensorResponse toResponse(DataSensorEntity entity);

    @Named("formatId")
    default String formatId(Long id) {
        if (id == null) {
            return null;
        }
        return String.format("SEN%03d", id);
    }

}
