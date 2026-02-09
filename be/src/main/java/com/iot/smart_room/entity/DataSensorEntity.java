package com.iot.smart_room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Table(name = "data_sensors")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data

public class DataSensorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sensor_id", nullable = false)
    private SensorEntity sensor;

    @Column(name = "value")
    private Long value;

    @Column(name = "created_at",  columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", nullable = false )
    private LocalDateTime createdAt;

}
