package com.icaro.icarobackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsDTO {
    private String id;
    private String title;
    private String description;
    private Integer pageNumber;
    private Integer positionInPage;
}