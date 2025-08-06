package com.icaro.icarobackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document("works")
@Data
@Builder
public class Work {
    @Id
    String putCode;             // Local Identificator
    String orcidOwner;
    private String title;
    private String description;
    private List<String> participants; // Name Participants
    private List<String> externalIds;
    private List<String> tags;
    private List<String> ownerOrcids; // OIDS Participants
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate projectDate;
}
