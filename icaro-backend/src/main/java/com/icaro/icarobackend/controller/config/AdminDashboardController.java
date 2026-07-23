package com.icaro.icarobackend.controller.config;


import com.icaro.icarobackend.dto.DashboardStatsDTO;
import com.icaro.icarobackend.repository.InvestigatorRepository;
import com.icaro.icarobackend.repository.NewRepository;
import com.icaro.icarobackend.repository.WorkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "http://localhost:4321", allowCredentials = "true")
public class AdminDashboardController {

    @Autowired
    private InvestigatorRepository investigatorRepository;

    @Autowired
    private NewRepository newsRepository;

    @Autowired
    private WorkRepository workRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        long investigators = investigatorRepository.count();
        long news = newsRepository.count();
        long works = workRepository.count();


        return ResponseEntity.ok(new DashboardStatsDTO(investigators, news, works));
    }
}