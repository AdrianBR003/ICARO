package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.service.ProjectWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project-work")
@RequiredArgsConstructor
public class ProjectWorkController {

    private final ProjectWorkService projectWorkService;

    @GetMapping("/project/{projectId}/works")
    public ResponseEntity<List<Work>> getWorksByProject(@PathVariable String projectId) {
        try {
            List<Work> works = projectWorkService.getWorksByProject(projectId);
            return ResponseEntity.ok(works);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
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