package com.icaro.icarobackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document("news")
@Data
@AllArgsConstructor
@Builder
public class New {

    @Id
    String id;
    private String title;
    private String description;
    private String link;
    private boolean highlighted;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate publicationDate;
    // String del nombre de la imagen para luego identificarla mejor
    private String imageName;

    public New() {}
}
