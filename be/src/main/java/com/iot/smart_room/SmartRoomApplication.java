package com.iot.smart_room;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.integration.config.EnableIntegration;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

@SpringBootApplication
@EnableIntegration
@org.springframework.integration.annotation.IntegrationComponentScan
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)

public class SmartRoomApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartRoomApplication.class, args);
	}

}
