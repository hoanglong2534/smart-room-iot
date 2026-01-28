package com.iot.smart_room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sensors")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SensorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "created_at",  columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", nullable = false )
    private LocalDateTime created_at;

    @OneToMany(mappedBy = "sensor", cascade = CascadeType.ALL)
    private List<DataSensorEntity> dataSensors;
}
