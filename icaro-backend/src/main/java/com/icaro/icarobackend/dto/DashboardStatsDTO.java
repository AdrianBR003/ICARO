package com.icaro.icarobackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {
    private long investigatorsCount;
    private long newsCount;
    private long worksCount; // "Researchs"
}