package com.icaro.icarobackend.service;
import com.icaro.icarobackend.model.New;
import com.icaro.icarobackend.repository.NewRepository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors; // Import para los logs

@Slf4j
@Service
public class NewService {

    private final NewRepository newRepository;
    private final MongoTemplate mongoTemplate;

    public NewService(NewRepository newRepository, MongoTemplate mongoTemplate) {
        this.newRepository = newRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Page<New> findPage(Pageable pageable) {
        Query query = new Query();
        query.with(pageable);
        List<New> list = mongoTemplate.find(query, New.class);
        if (!list.isEmpty()) {
            String titulos = list.stream()
                    .map(New::getTitle) // O .map(New::getId)
                    .collect(Collectors.joining(", "));
        }

        return PageableExecutionUtils.getPage(
                list,
                pageable,
                () -> mongoTemplate.count(Query.of(query).limit(-1).skip(-1), New.class)
        );
    }

    public Page<New> searchNews(String textQuery, Pageable pageable) {
        String escapedQuery = escapeRegexCharacters(textQuery);
        Criteria criteria = new Criteria().orOperator(
                Criteria.where("title").regex(escapedQuery, "i"),
                Criteria.where("description").regex(escapedQuery, "i")
        );

        Query query = new Query(criteria);
        query.with(pageable);

        List<New> list = mongoTemplate.find(query, New.class);

        return PageableExecutionUtils.getPage(
                list,
                pageable,
                () -> mongoTemplate.count(Query.of(query).limit(-1).skip(-1), New.class)
        );
    }

    private String escapeRegexCharacters(String input) {
        String[] specialChars = {"\\", "^", "$", ".", "|", "?", "*", "+", "(", ")", "[", "]", "{", "}"};

        String result = input;
        for (String specialChar : specialChars) {
            result = result.replace(specialChar, "\\" + specialChar);
        }

        return result;
    }


    public List<New> findAll() {
        return newRepository.findAll();
    }

    public boolean updateNew(New n){
        if(this.newRepository.findById(n.getId()).isEmpty()){
            log.info("Error Update New");
             throw new IllegalArgumentException("No se ha encontrado un ID para actualizar");
        }else{
            this.newRepository.save(n);
            return true;
        }
    }

    public boolean addNew(New n) {
        if(this.newRepository.findById(n.getId()).isPresent()){
            log.info("Ya existe un id para esta noticia");
            throw new IllegalArgumentException("La noticia con id " + n.getId() + " ya existe.");
        }else{
            log.info("Noticia Añadida Correctamente");
            this.newRepository.save(n);
            return true;
        }
    }

    public Optional<New> findById(String id) {
        return this.newRepository.findById(id);
    }

    public boolean deleteNew(String id) {
        if(this.newRepository.findById(id).isPresent()){
            newRepository.deleteById(id);
            return true;
        }else{
            throw new IllegalArgumentException("No existe el id del registro");
        }
    }

    public List<New> getHighlightedNews() {
        return this.newRepository.findByHighlighted(true);
    }
}