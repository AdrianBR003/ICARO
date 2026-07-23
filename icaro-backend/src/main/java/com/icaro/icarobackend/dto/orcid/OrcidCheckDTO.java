package com.icaro.icarobackend.dto.orcid;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OrcidCheckDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String orcidId;
        private List<OrcidWorkItem> works;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrcidWorkItem {
        private String title;
        private String putCode;
        private String year;
        private String type;
    }

    @Data
    @AllArgsConstructor
    public static class Response {
        private List<AnalyzedWork> works;
    }

    @Data
    @AllArgsConstructor
    public static class AnalyzedWork { // Resultado tras comparacion
        private String putCode;
        private String title;
        private String year;
        private String type;

        @JsonProperty("isDuplicate")
        private boolean isDuplicate;
        private String duplicateReason; // "Por ID (PutCode)" o "Por Título"
        private String existingWorkId;    // ID en nuestra BBDD si existe
    }
}