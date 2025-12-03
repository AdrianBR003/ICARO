package com.icaro.icarobackend.service;

import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.repository.ProjectRepository;
import com.icaro.icarobackend.repository.WorkRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // Metodo para la paginacion
    public Page<Work> getWorkPaged(String title, Pageable pageable) {
        if (title != null && !title.trim().isEmpty()) {
            return workRepository.findByTitleContainingIgnoreCase(title, pageable);
        } else {
            return workRepository.findAll(pageable);
        }
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
