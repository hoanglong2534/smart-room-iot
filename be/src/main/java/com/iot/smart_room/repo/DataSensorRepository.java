package com.iot.smart_room.repo;

import com.iot.smart_room.entity.DataSensorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface DataSensorRepository extends JpaRepository<DataSensorEntity, Long>, JpaSpecificationExecutor<DataSensorEntity> {
}
