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

            if(request.getSensorId() != null){
                predicateList.add(
                        criteriaBuilder.equal(root.get("sensor").get("id"), request.getSensorId())
                );
            }

            if(request.getSensorName() != null && !request.getSensorName().isBlank()){
                predicateList.add(
                        criteriaBuilder.equal(root.get("sensor").get("name"), request.getSensorName())
                );
            }


            if(request.getValue() != null){
                predicateList.add(
                        criteriaBuilder.equal(root.get("value"), request.getValue())
                );
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
