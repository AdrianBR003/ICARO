package com.icaro.icarobackend.repository;

import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.model.Work;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface WorkRepository extends MongoRepository<Work,String> {

    List<Work> findByProjectId(String projectId);

    Page<Work> findByTitleContainingIgnoreCase(String title, Pageable pageable);

}
