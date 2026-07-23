package com.icaro.icarobackend.repository;

import com.icaro.icarobackend.model.Investigator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface InvestigatorRepository extends MongoRepository<Investigator,String> {

    Page<Investigator> findByGivenNamesContainingIgnoreCaseOrFamilyNameContainingIgnoreCase(
            String givenNames, String familyName, Pageable pageable);

    Optional<Object> findByOrcid(String orcid);
}
