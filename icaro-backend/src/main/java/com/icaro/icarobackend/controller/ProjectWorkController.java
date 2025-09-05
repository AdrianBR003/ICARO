package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.service.ProjectService;
import com.icaro.icarobackend.service.ProjectWorkService;
import com.icaro.icarobackend.service.WorkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/project-work")
@RequiredArgsConstructor
public class ProjectWorkController {

    private final ProjectWorkService projectWorkService;
    private final ProjectService projectService;

    @GetMapping("/project/{projectId}/works")
    public ResponseEntity<List<Work>> getWorksByProject(@PathVariable String projectId) {
        try {
            List<Work> works = projectWorkService.getWorksByProject(projectId);
            return ResponseEntity.ok(works);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Extraer el nombre a partir del ID

    @GetMapping("/name/{projectId}")
    public ResponseEntity<String> getNamebyProjectId(@PathVariable String projectId) {
        log.info("getNamebyProjectId {}", projectId);
        Project p = this.projectService.findById(projectId).orElseGet(null);
        if(p==null){
            log.info("not found");
            return ResponseEntity.notFound().build();
        }else {
            log.info("found");
            return ResponseEntity.ok(p.getTitle());
        }
    }
    // Relación N:N
    @GetMapping("/work/{workId}/project")
    public ResponseEntity<Project> getProjectByWork(@PathVariable String workId) {
        try {
            Project project = projectWorkService.getProjectByWork(workId);
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}