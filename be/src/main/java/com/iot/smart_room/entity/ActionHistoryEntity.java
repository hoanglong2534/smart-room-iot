package com.iot.smart_room.entity;

import com.iot.smart_room.enums.ActionEnum;
import com.iot.smart_room.enums.StatusEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Table(name = "action_histories")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ActionHistoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "device_id", nullable = false)
    private DeviceEntity device;

    @Column(name = "action")
    private ActionEnum action;

    @Column(name = "status")
    private StatusEnum status;

    @Column(name = "created_at",  columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", nullable = false )
    private LocalDateTime created_at;

}
