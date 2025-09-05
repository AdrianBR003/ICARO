package com.icaro.icarobackend.repository;

import com.icaro.icarobackend.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<Project,String> {

    // Relacion N:N

    List<Project> findByWorkIdsContaining(String workId);

    List<Project> findByTitleContainingIgnoreCase(String title);

    @Query("{ 'workIds': { '$in': ?0 } }")
    List<Project> findByWorkIdsIn(List<String> workIds);

}
