package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project")
public class ProjectController {

    private final ProjectRepository projectRepository;

    @Autowired
    public ProjectController(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @GetMapping("/all")
    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    @PostMapping("/save ")
    public ResponseEntity<?> addProject(@RequestBody Project project) {
        if(this.projectRepository.findById(project.getId()).isPresent()){
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }else{
            this.projectRepository.save(project);
            return ResponseEntity.ok().build();
        }
    }
}
