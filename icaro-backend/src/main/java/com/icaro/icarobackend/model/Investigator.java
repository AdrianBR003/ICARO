package com.icaro.icarobackend.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Singular;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("investigators")
@Data
@Builder
@AllArgsConstructor
public class Investigator {
    @Id
    private String orcid;
    private String givenNames;
    private String familyName;
    private String email;
    private String role;
    private String phone;
    private String office;
    private String biography;
}
