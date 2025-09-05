package com.icaro.icarobackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

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
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate projectDate;

    @Indexed
    private List<String> workIds; // IDs de los works relacionados

}
