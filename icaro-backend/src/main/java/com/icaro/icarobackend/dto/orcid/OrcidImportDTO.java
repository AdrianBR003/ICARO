package com.icaro.icarobackend.dto.orcid;

import lombok.Data;
import java.util.List;

@Data
public class OrcidImportDTO {
    // Datos Personales
    private String orcidId;
    private String firstName;
    private String lastName;
    private String role;
    private String office;
    private String email;
    private String phone;
    private String biography;

    // Lista de obras SELECCIONADAS para importar
    private List<ImportWorkItem> works;

    @Data
    public static class ImportWorkItem {
        private String title;
        private String year;
        private String type;
        private String putCode;
    }
}