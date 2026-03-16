package com.iot.smart_room.repo;

import com.iot.smart_room.entity.SensorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface SensorRepository extends JpaRepository<SensorEntity, Long> {
    Optional<SensorEntity> findByName(String name);

    @Query("select s.name from SensorEntity s")
    Set<String> getAllName();

}
