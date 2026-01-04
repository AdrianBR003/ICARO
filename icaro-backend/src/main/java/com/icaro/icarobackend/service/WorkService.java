package com.icaro.icarobackend.service;

import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.repository.ProjectRepository;
import com.icaro.icarobackend.repository.WorkRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
@Slf4j
@Service
public class WorkService {

    WorkRepository workRepository;
    ProjectRepository projectRepository;

    @Autowired
    private MongoTemplate mongoTemplate; // Lo vamos a utilizar para coger los datos resultantes por los filtros


    public WorkService(WorkRepository workRepository, ProjectRepository projectRepository) {
        this.workRepository = workRepository;
        this.projectRepository = projectRepository;
    }

    public List<Work> getAllWorks(){
        return workRepository.findAll();
    }

    public List<Work> getWorksForInvestigator(String orcid){
        return workRepository.findAll().stream()
                .filter(w -> w.getOwnerOrcids().contains(orcid))
                .collect(Collectors.toList());
    }

    /**
     * Búsqueda Dinámica: Filtra por Título, Proyecto y/o Etiqueta.
     */
    public Page<Work> getWorksPaged(String title, String projectId, String tag, Pageable pageable) {
        Query query = new Query().with(pageable);
        List<Criteria> criteria = new ArrayList<>();

        // 1. Filtro por Título (Búsqueda de texto parcial e insensible a mayúsculas)
        if (title != null && !title.trim().isEmpty()) {
            criteria.add(Criteria.where("title").regex(Pattern.quote(title), "i"));
        }

        // 2. Filtro por Proyecto (Coincidencia exacta)
        if (projectId != null && !projectId.trim().isEmpty()) {
            criteria.add(Criteria.where("projectId").is(projectId));
        }

        // 3. Filtro por Etiqueta (Si el array 'tags' contiene esta etiqueta)
        if (tag != null && !tag.trim().isEmpty()) {
            criteria.add(Criteria.where("tags").is(tag)); // Mongo maneja arrays automáticamente
        }

        // Aplicar criterios si existen
        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }

        // Ejecutar consulta
        List<Work> list = mongoTemplate.find(query, Work.class);

        // Contar total para la paginación (count optimizado)
        // Nota: Query.of(query).limit(0).skip(0) limpia la paginación para contar el total real
        long count = mongoTemplate.count(Query.of(query).limit(0).skip(0), Work.class);

        return new PageImpl<>(list, pageable, count);
    }

    /**
     * Obtiene todas las etiquetas únicas usadas en la colección.
     * Útil para llenar el filtro de la UI.
     */
    public List<String> getAllUniqueTags() {
        // "tags" es el nombre del campo en MongoDB, Work.class es la entidad
        return mongoTemplate.findDistinct(new Query(), "tags", Work.class, String.class);
    }

    /**
     * Nota de la función: Debe de tener el titulo exactamente igual, si no es así, no lo guardará.
     * @param work
     */
    public void saveWork(Work work){
        log.info("Saving work: {}", work);
        if(work!=null){
            workRepository.save(work);
        }else{
            throw new IllegalArgumentException("Invalid work");
        }
    }

    public void deleteWork(String id){
        log.info("Deleting work: {}", id);
        this.workRepository.deleteById(id);
    }

}
