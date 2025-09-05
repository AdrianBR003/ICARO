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
    String putCode;             // Local Identificator
    String orcidOwner;
    private String title;
    private String description;
    private List<String> participants; // Name Participants
    private List<String> externalIds;
    private List<String> ownerOrcids; // OIDS Participants
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate projectDate;

    private String projectId; // ID del proyecto al que pertenece

    /**
     * Esta variable es muy importante tener en cuenta su estructura:
     *  <p>> En la posición 0 -> Tipo de Work, ej: Journal-Article, Conference-paper, .. </p>
     *  > En las siguientes (a partir de la 0) -> Tags aparte, que no sean el proyectoID porque eso se guarda en la anterior variable
     */
    private List<String> tags;


    // Activar si en un futuro se quiere una relación N:N
//    @Indexed
//    private List<String> projectIds; // IDs de los proyectos relacionados
}
