package com.iot.smart_room.repo;

import com.iot.smart_room.entity.DeviceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Repository
public interface DeviceRepository extends JpaRepository<DeviceEntity, Long> {

    @Query("select d.name from DeviceEntity d")
    Set<String> getAllName();

    @Modifying
    @Transactional
    @Query("UPDATE DeviceEntity d SET d.current_status = :status, d.state = :status WHERE d.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    Optional<DeviceEntity> findByName(String name);

}
