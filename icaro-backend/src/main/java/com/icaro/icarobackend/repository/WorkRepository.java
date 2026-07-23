package com.icaro.icarobackend.repository;

import com.icaro.icarobackend.model.Project;
import com.icaro.icarobackend.model.Work;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WorkRepository extends MongoRepository<Work,String> {

    List<Work> findByProjectId(String projectId);

    Page<Work> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Optional<Work> findByPutCode(String putCode);

    @Query("{ 'title': { $regex: '^?0', $options: 'i' } }")
    List<Work> findByTitleStartingWith(String titleFragment);

    @Query("{ 'title': { $regex: ?0, $options: 'i' } }")
    List<Work> findByTitleContainingRegex(String titleFragment);
}
