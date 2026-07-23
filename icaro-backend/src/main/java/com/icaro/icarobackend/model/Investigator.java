package com.icaro.icarobackend.model;


import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("investigators")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
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
    private String imageName;
}
