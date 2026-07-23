package com.icaro.icarobackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document("works")
@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class Work {
    @Indexed(unique = true, sparse = true)
    private String putCode;
    @Id
    String id;             // Local Identificator
    String orcidOwner;
    private String title;
    private String description;
    private List<String> participants;
    private List<String> externalIds;
    private List<String> ownerOrcids;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate projectDate;
    private String projectId; // ID del proyecto al que pertenece
    private List<String> tags;

}
