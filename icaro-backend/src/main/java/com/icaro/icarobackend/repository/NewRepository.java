package com.icaro.icarobackend.repository;

import com.icaro.icarobackend.model.New;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NewRepository extends MongoRepository<New, String> {
}
