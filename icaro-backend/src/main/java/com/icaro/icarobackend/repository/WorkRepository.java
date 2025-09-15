package com.icaro.icarobackend.repository;

import com.icaro.icarobackend.model.Work;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface WorkRepository extends MongoRepository<Work,String> {

    List<Work> findByProjectId(String projectId);

    Work findWorkByTitle(String title);


    // Activar si se desea la relación N:N

//    List<Work> findByProjectIdsContaining(String projectId);
//
//    List<Work> findByOrcidOwner(String orcidOwner);
//
//    List<Work> findByOwnerOrcidsContaining(String orcid);
//
//    @Query("{ 'projectIds': { '$in': ?0 } }")
//    List<Work> findByProjectIdsIn(List<String> projectIds);

}
