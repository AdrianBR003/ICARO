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

    List<New> findAll();

    List<New> findAllByOrderByPublicationDateDesc();

    /**
     * Busca usando @Query Y AÑADE EL SORT DENTRO DE LA QUERY.
     * El Pageable solo se usará para la paginación (página/tamaño).
     */
    @Query(value = "{$or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ]}",
            sort = "{ 'publicationDate': -1 }")
    Page<New> searchByTitleOrDescription(String query, Pageable pageable);

    /**
     * Obtiene todos los documentos (value = "{}")
     * Y los ordena por fecha (sort = "...").
     * El Pageable solo se usará para la paginación (página/tamaño).
     */
    @Query(value = "{}", sort = "{ 'publicationDate': -1 }")
    Page<New> findAllSortedAndPaged(Pageable pageable);

    Page<New> findAllByOrderByPublicationDateDesc(Pageable pageable);

    Page<New> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderByPublicationDateDesc(
            String titleQuery,
            String descriptionQuery,
            Pageable pageable
    );
}