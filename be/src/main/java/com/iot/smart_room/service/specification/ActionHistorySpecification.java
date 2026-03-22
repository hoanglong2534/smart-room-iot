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

    public Specification<ActionHistoryEntity> search(ActionHistoryRequest request){
        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicateList = new ArrayList<>();

            if(request.getDeviceId() != null && !request.getDeviceId().isBlank()){
                predicateList.add(
                        criteriaBuilder.equal(root.get("device").get("id"), request.getDeviceId())
                );
            }

            if(request.getDeviceName() != null && !request.getDeviceName().isBlank()){
                predicateList.add(
                        criteriaBuilder.equal(root.get("device").get("name"), request.getDeviceName())
                );
            }

            if(request.getFrom() != null && request.getTo() != null){
                predicateList.add(
                        criteriaBuilder.between(root.get("createdAt"), request.getFrom(), request.getTo())
                );
            }

            return criteriaBuilder.and(predicateList.toArray(new Predicate[0]));
        };
    }

}
