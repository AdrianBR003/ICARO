package com.icaro.icarobackend.service;

import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.repository.ProjectRepository;
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

    public void save(Project project) {
        projectRepository.save(project);
    }

    public Optional<Project> findById(String id) {
        return projectRepository.findById(id);
    }

}
