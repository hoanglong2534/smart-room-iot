package com.iot.smart_room.repo;

import com.iot.smart_room.entity.SensorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SensorRepository extends JpaRepository<SensorEntity, Long> {
    Optional<SensorEntity> findByName(String name);
}
