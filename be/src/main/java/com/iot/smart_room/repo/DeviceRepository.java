package com.iot.smart_room.repo;

import com.iot.smart_room.entity.DeviceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface DeviceRepository extends JpaRepository<DeviceEntity, Long> {

    @Query("select d.name from DeviceEntity d")
    Set<String> getAllName();

}
