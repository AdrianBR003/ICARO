package com.icaro.icarobackend.repository;

import com.icaro.icarobackend.dto.ProjectSelectorDTO;
import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.model.Work;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<Project,String> {

    Project findByTitle(String title);
    @Query(value = "{}", fields = "{ 'id' : 1, 'title' : 1 }")
    List<ProjectSelectorDTO> findAllProjectSummaries();
    Page<Project> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
