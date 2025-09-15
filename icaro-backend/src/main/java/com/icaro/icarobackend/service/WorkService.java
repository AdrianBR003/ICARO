package com.icaro.icarobackend.service;

import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.repository.ProjectRepository;
import com.icaro.icarobackend.repository.WorkRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
@Slf4j
@Service
public class WorkService {

    WorkRepository workRepository;
    OrcidService orcidService;
    ProjectRepository projectRepository;

    public WorkService(WorkRepository workRepository, OrcidService orcidService, ProjectRepository projectRepository) {
        this.workRepository = workRepository;
        this.orcidService = orcidService;
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
     * Nota de la función: Debe de tener el titulo exactamente igual, si no es así, no lo guardará.
     * @param work
     */
    public void saveWork(Work work){
        log.info("Saving work: {}", work);
        // Llega el projectId como el nombre del proyecto, por lo que tenemos que hacer la conversión
        String title = work.getProjectId();
        log.info("Buscando con projectId='{}' (length={})", title, title.length());
        Project p = this.projectRepository.findByTitle(title);
        if(p == null){
            log.error("ERROR EN LA CONVERSION -> null ");
        }else{
            log.info("Conversión Work: {}", work);
            work.setProjectId(p.getId());
            this.workRepository.save(work);
        }
    }

}
