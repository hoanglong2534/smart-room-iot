package com.iot.smart_room.service.specification;

import com.iot.smart_room.dto.request.ActionHistoryRequest;
import com.iot.smart_room.entity.ActionHistoryEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ActionHistorySpecification {

    public Specification<ActionHistoryEntity> search(ActionHistoryRequest request) {
        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicateList = new ArrayList<>();

            if (request.getDeviceId() != null && !request.getDeviceId().isBlank()) {
                predicateList.add(
                        criteriaBuilder.equal(root.get("device").get("id"), request.getDeviceId()));
            }

            if (request.getDeviceName() != null && !request.getDeviceName().isBlank()) {
                predicateList.add(
                        criteriaBuilder.equal(root.get("device").get("name"), request.getDeviceName()));
            }

            if (request.getAction() != null && !request.getAction().isBlank()) {
                predicateList.add(
                        criteriaBuilder.equal(root.get("action"),
                                com.iot.smart_room.enums.ActionEnum.valueOf(request.getAction())));
            }

            if (request.getStatus() != null && !request.getStatus().isBlank()) {
                predicateList.add(
                        criteriaBuilder.equal(root.get("status"),
                                com.iot.smart_room.enums.StatusEnum.valueOf(request.getStatus())));
            }

            if (request.getTime() != null) {
                predicateList.add(
                        criteriaBuilder.equal(root.get("createdAt"), request.getTime())
                );
            }

            return criteriaBuilder.and(predicateList.toArray(new Predicate[0]));
        };
    }

}
