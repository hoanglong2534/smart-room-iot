package com.iot.smart_room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Table(name = "devices")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class DeviceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "current_status")
    private String current_status;

    @Column(name = "created_at",  columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", nullable = false )
    private LocalDateTime created_at;

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL)
    private List<ActionHistoryEntity> actionHistories;

}
