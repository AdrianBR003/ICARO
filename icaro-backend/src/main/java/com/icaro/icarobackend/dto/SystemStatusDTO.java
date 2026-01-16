package com.icaro.icarobackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SystemStatusDTO {
    private boolean online;
    private String serviceName;
    private String version;
    private double memoryUsage; // Porcentaje (0-100)
    private String uptime;
}