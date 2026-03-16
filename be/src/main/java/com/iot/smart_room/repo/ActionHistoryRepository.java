package com.iot.smart_room.repo;

import com.iot.smart_room.entity.ActionHistoryEntity;
import com.iot.smart_room.enums.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

public interface ActionHistoryRepository extends JpaRepository<ActionHistoryEntity, Long>, JpaSpecificationExecutor<ActionHistoryEntity> {
    Optional<ActionHistoryEntity> findFirstByDeviceIdAndStatusOrderByCreatedAtDesc(Long deviceId, StatusEnum status);
}
