package com.iot.smart_room.service.specification;

import com.iot.smart_room.dto.request.DataSensorRequest;
import com.iot.smart_room.entity.DataSensorEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DataSensorSpecification {

    public Specification<DataSensorEntity> search(DataSensorRequest request){
        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicateList = new ArrayList<>();

            if(request.getName() != null && !request.getName().isBlank()){
                predicateList.add(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("sensor").get("name")), "%" + request.getName().toLowerCase() + "%")
                );
            }

            if(request.getValue() != null){
                predicateList.add(
                        criteriaBuilder.equal(root.get("value"), request.getValue())
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
