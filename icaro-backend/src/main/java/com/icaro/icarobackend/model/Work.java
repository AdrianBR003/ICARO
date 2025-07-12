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
    String putCode;             // Local Identificator
    String orcidOwner;
    private String title;
    private String description;
    private String type;
    private List<String> participants; // Name Participants
    private List<String> externalIds;
    private List<String> ownerOrcids; // OIDS Participants
}
