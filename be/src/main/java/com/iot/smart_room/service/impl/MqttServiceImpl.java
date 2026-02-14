package com.iot.smart_room.service.impl;

import com.iot.smart_room.service.MqttService;
import com.iot.smart_room.utils.MqttUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MqttServiceImpl implements MqttService {

    private final MqttUtils mqttUtils;

    @Override
    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(Message<?> message) {
        String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
        Object payloadObj = message.getPayload();
        String payload = payloadObj.toString();

        if ("smartroom/collect-data".equals(topic)) {
            mqttUtils.processSensorData(payload);
        } else if (topic != null && topic.startsWith("smartroom/status/device/")) {
            mqttUtils.processDeviceStatus(topic, payload);
        }
    }
}
