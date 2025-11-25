package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.repository.ProjectRepository;
import com.icaro.icarobackend.service.ProjectService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project")
@Slf4j
public class ProjectController {

    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // ---------- METODOS SIN VERIFICACION -------------

    @GetMapping("/all")
    public ResponseEntity<List<Project>> findAll() {
        return ResponseEntity.ok(this.projectService.findAll());
    }

    @PostMapping("/save")
    public ResponseEntity<?> addProject(@RequestBody Project project) {
        log.info("adding project {}", project);
        if(this.projectService.findById(project.getId()).isPresent()){
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }else{
            this.projectService.save(project);
            return ResponseEntity.ok().build();
        }
    }

    @GetMapping("/titles")
    public ResponseEntity<List<String>> getTitlesProjects(){
        log.info("getting titles of projects");
        return ResponseEntity.ok(projectService.getTitlesProjects());
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<Project>> getProjectsPaged(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        // Ordenamos por fecha de inicio (más reciente primero)
        Sort stableSort = Sort.by(
                Sort.Order.desc("firstProjectDate"),
                Sort.Order.desc("id")
        );

        Pageable pageable = PageRequest.of(page, size, stableSort);

        Page<Project> projects = projectService.getProjectsPaged(query, pageable);

        return ResponseEntity.ok(projects);
    }

    // ---------- METODOS CON VERIFICACION -------------


    @PostMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProject(@RequestBody Project project) {
        if(this.projectService.findById(project.getId()).isPresent()){
            this.projectService.save(project);
            return ResponseEntity.ok().build();
        }else{
            return  ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProject(@PathVariable String id) {
        if(this.projectService.findById(id).isPresent()){
            this.projectService.deleteById(id);
            return  ResponseEntity.ok().build();
        }else{
            return  ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

}
