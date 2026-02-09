package com.iot.smart_room.repo;

import com.iot.smart_room.entity.ActionHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ActionHistoryRepository extends JpaRepository<ActionHistoryEntity, Long>, JpaSpecificationExecutor<ActionHistoryEntity> {
}
