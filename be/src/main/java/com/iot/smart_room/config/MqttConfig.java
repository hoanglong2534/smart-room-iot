package com.iot.smart_room.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.core.MessageProducer;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.integration.dsl.IntegrationFlow;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.messaging.MessageChannel;

@Configuration
public class MqttConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    @Value("${mqtt.broker-url}")
    private String brokerUrl;

    @Value("${mqtt.client-id}")
    private String clientId;

    @Value("${mqtt.topic.sensor}")
    private String sensorTopic;

    @Value("${mqtt.topic.device-status}")
    private String deviceStatusTopic;

    @Value("${mqtt.username:}")
    private String username;

    @Value("${mqtt.password:}")
    private String password;

    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[] { brokerUrl });
        if (username != null && !username.isEmpty()) options.setUserName(username);
        if (password != null && !password.isEmpty()) options.setPassword(password.toCharArray());
        options.setCleanSession(true);
        factory.setConnectionOptions(options);
        return factory;
    }

    @Bean
    public MessageChannel mqttInputChannel() { return new DirectChannel(); }

    @Bean
    public IntegrationFlow mqttInboundFlow() {
        return IntegrationFlow.from(new MqttPahoMessageDrivenChannelAdapter(clientId, mqttClientFactory(), sensorTopic, deviceStatusTopic))
                .channel(mqttInputChannel())
                .get();
    }

    @Bean
    public MessageChannel mqttOutboundChannel() {
        return new DirectChannel();
    }

    @Bean
    @org.springframework.integration.annotation.ServiceActivator(inputChannel = "mqttOutboundChannel")
    public org.springframework.messaging.MessageHandler mqttOutbound() {
        org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler messageHandler = 
                new org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler(clientId + "_out", mqttClientFactory());
        messageHandler.setAsync(true);
        messageHandler.setDefaultTopic("smartroom/control");
        return messageHandler;
    }
}
