package com.iot.smart_room.repo;

import com.iot.smart_room.entity.DataSensorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DataSensorRepository extends JpaRepository<DataSensorEntity, Long>, JpaSpecificationExecutor<DataSensorEntity> {

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE data_sensors SET sensor_id = :toId WHERE sensor_id = :fromId", nativeQuery = true)
    int reassignSensorId(@Param("fromId") long fromId, @Param("toId") long toId);
}
