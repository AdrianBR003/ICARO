package com.icaro.icarobackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuditLogDTO {
    private String timestamp;
    private String actor;    // Admin
    private String action;   // CREATE, UPDATE...
    private String entity;   // INVESTIGATOR
    private String details;
    private String url;
}