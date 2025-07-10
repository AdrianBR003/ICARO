package com.icaro.icarobackend.repository;

import com.icaro.icarobackend.model.Investigator;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InvestigatorRepository extends MongoRepository<Investigator,String> {

}
