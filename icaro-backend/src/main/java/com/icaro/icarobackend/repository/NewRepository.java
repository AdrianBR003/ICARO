package com.icaro.icarobackend.repository;

import com.icaro.icarobackend.model.New;
import com.mongodb.lang.NonNullApi;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NewRepository extends MongoRepository<New, String> {
    List<New> findByHighlighted(boolean highlighted);

    Page<New> findAll(Pageable pageable);

    List<New> findAll();

    @Query(value = "{$or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ]}",
            sort = "{ 'publicationDate': -1 }")
    List<New> searchByTitleOrDescription(String query);

    List<New> findAllByOrderByPublicationDateDesc();
}
