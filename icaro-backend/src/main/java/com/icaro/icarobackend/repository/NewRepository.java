package com.icaro.icarobackend.repository;

import com.icaro.icarobackend.model.New;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NewRepository extends MongoRepository<New, String> {
    List<New> findByHighlighted(boolean highlighted);
}
