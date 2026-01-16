package com.icaro.icarobackend.service.page;

import com.icaro.icarobackend.dto.ProjectSelectorDTO;
import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.repository.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public Page<Project> getProjectsPaged(String query, Pageable pageable) {
        if (query != null && !query.trim().isEmpty()) {
            return projectRepository.findByTitleContainingIgnoreCase(query, pageable);
        } else {
            return projectRepository.findAll(pageable);
        }
    }

    public List<ProjectSelectorDTO> getProjectTitles() {
        return projectRepository.findAllProjectSummaries();
    }

    public void save(Project project) {
        projectRepository.save(project);
    }

    public Optional<Project> findById(String id) {
        return projectRepository.findById(id);
    }

    public void deleteById(String id) {
        projectRepository.deleteById(id);
    }

}
