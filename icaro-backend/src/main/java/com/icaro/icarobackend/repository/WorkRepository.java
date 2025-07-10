package com.icaro.icarobackend.repository;

import com.icaro.icarobackend.model.Work;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface WorkRepository extends MongoRepository<Work,String> {
}
