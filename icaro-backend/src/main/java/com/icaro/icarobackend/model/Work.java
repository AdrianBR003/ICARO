package com.icaro.icarobackend.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document("works")
@Data
@Builder
public class Work {
    @Id
    private String putCode;
    private String title;
    private String description;
    private String type;
    private List<String> participants;
    private List<String> externalIds;
}
