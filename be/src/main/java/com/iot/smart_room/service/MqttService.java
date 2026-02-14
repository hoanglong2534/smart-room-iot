package com.iot.smart_room.service;

import org.springframework.messaging.Message;

public interface MqttService {
    void handleMessage(Message<?> message);
}
