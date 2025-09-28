package com.icaro.icarobackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
public class IcaroBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(IcaroBackendApplication.class, args);
    }

}
