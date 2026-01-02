package com.icaro.icarobackend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document("works")
@Data
@Builder
public class Work {
    @Id
    String id;             // Local Identificator
    String orcidOwner;
    private String title;
    private String description;
    private List<String> participants; // Name Participants
    private List<String> externalIds;
    private List<String> ownerOrcids; // OIDS Participants, para en un futuro enlazar a un perfil con las publicaciones
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate projectDate;
    private String projectId; // ID del proyecto al que pertenece
    private List<String> tags;


    // Activar si en un futuro se quiere una relación N:N
//    @Indexed
//    private List<String> projectIds; // IDs de los proyectos relacionados
}
