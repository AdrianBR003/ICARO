package com.icaro.icarobackend.service.page;

import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.repository.ProjectRepository;
import com.icaro.icarobackend.repository.WorkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectWorkService {

    private final ProjectRepository projectRepository;
    private final WorkRepository workRepository;
    private final MongoTemplate mongoTemplate;

    /**
     * RELACIÓN 1:N - Asocia un Work a un Project
     */
    @Transactional
    public void addWorkToProject(String projectId, String workId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        Work work = workRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Work not found: " + workId));

        if (work.getProjectId() != null && !work.getProjectId().equals(projectId)) {
            throw new RuntimeException("Work already belongs to another project");
        }

        // Actualizar referencias (1:N)
        if (project.getWorkIds() == null) {
            project.setWorkIds(new ArrayList<>());
        }
        if (!project.getWorkIds().contains(workId)) {
            project.getWorkIds().add(workId);
        }

        work.setProjectId(projectId);

        // Guardar ambos documentos
        projectRepository.save(project);
        workRepository.save(work);
    }

    /**
     * RELACIÓN 1:N - Desasocia un Work de un Project
     */
    @Transactional
    public void removeWorkFromProject(String projectId, String workId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        Work work = workRepository.findById(workId).orElse(null);

        if (project != null && project.getWorkIds() != null) {
            project.getWorkIds().remove(workId);
            projectRepository.save(project);
        }

        if (work != null && projectId.equals(work.getProjectId())) {
            work.setProjectId(null);
            workRepository.save(work);
        }
    }

    /**
     * RELACIÓN 1:N - Obtiene todos los Works de un Project
     */
    public List<Work> getWorksByProject(String projectId) {
        // Para 1:N - uso directo del repository method
        return workRepository.findByProjectId(projectId);

        // PARA RELACIÓN N:N FUTURA - Descomentar y comentar la línea anterior:
        // Project project = projectRepository.findById(projectId)
        //         .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        // if (project.getWorkIds() == null || project.getWorkIds().isEmpty()) {
        //     return Collections.emptyList();
        // }
        // return workRepository.findAllById(project.getWorkIds());
    }

    /**
     * RELACIÓN 1:N - Obtiene el Project de un Work
     */
    public Project getProjectByWork(String workId) {
        Work work = workRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Work not found: " + workId));

        if (work.getProjectId() == null) {
            return null;
        }

        return projectRepository.findById(work.getProjectId()).orElse(null);

        // PARA RELACIÓN N:N FUTURA - Descomentar y modificar:
        // if (work.getProjectIds() == null || work.getProjectIds().isEmpty()) {
        //     return null;
        // }
        // // Solo devuelve el primer proyecto (o modificar para devolver lista)
        // return projectRepository.findById(work.getProjectIds().get(0)).orElse(null);
    }

    /**
     * RELACIÓN 1:N - Crea un Work y lo asocia a un Project
     */
    @Transactional
    public Work createWorkAndLinkToProject(Work work, String projectId) {
        Work savedWork = workRepository.save(work);
        addWorkToProject(projectId, savedWork.getId());
        return savedWork;
    }

    /**
     * RELACIÓN 1:N - Elimina un Work y limpia referencias
     */
    @Transactional
    public void deleteWorkAndCleanReferences(String workId) {
        Work work = workRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Work not found: " + workId));

        // Limpiar referencia en el proyecto
        if (work.getProjectId() != null) {
            projectRepository.findById(work.getProjectId()).ifPresent(project -> {
                if (project.getWorkIds() != null) {
                    project.getWorkIds().remove(workId);
                    projectRepository.save(project);
                }
            });
        }

        workRepository.deleteById(workId);
    }

    /**
     * RELACIÓN 1:N - Elimina un Project y todos sus Works
     */
    @Transactional
    public void deleteProjectAndWorks(String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        // Eliminar todos los works asociados
        if (project.getWorkIds() != null) {
            workRepository.deleteAllById(project.getWorkIds());
        }

        projectRepository.deleteById(projectId);

        // PARA RELACIÓN N:N FUTURA - Descomentar y comentar el metodo anterior:
        // // Solo limpia referencias, no elimina los works
        // if (project.getWorkIds() != null) {
        //     project.getWorkIds().forEach(workId -> {
        //         workRepository.findById(workId).ifPresent(work -> {
        //             if (work.getProjectIds() != null) {
        //                 work.getProjectIds().remove(projectId);
        //                 workRepository.save(work);
        //             }
        //         });
        //     });
        // }
        // projectRepository.deleteById(projectId);
    }
}