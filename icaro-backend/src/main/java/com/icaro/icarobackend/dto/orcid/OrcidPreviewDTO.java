package com.icaro.icarobackend.dto.orcid;

import lombok.Data;
import java.util.List;

@Data
public class OrcidPreviewDTO {
    private String orcidId;
    private String firstName;
    private String lastName;
    private String biography;
    private String email;
    private List<OrcidWorkDTO> works;

    @Data
    public static class OrcidWorkDTO {
        private String title;
        private String year;
        private String type;
        private String putCode; // ID único del trabajo en ORCID
    }
}