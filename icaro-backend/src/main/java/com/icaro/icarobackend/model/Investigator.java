package com.icaro.icarobackend.model;


import lombok.Builder;
import lombok.Data;
import lombok.Singular;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document("investigators")
@Data
@Builder
public class Investigator {
    @Id
    private String orcid;
    private String givenNames;
    private String familyName;
    private String email;
    private String biography;
}
