package com.icaro.icarobackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.util.List;

@Document("projects")
@Data
@Builder
public class Project {
    @Id
    String id;             // Local Identificator
    private String title;
    private String description;
    private List<String> participants; // Name Participants
    private List<String> tags;
    @Field("firstProjectDate")
    @JsonProperty("firstProjectDate")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate firstProjectDate;

    @Field("secondProjectDate")
    @JsonProperty("secondProjectDate")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate secondProjectDate;
    @Indexed
    private List<String> workIds;

}
