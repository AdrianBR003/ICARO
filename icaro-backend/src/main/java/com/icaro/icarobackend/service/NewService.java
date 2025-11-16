package com.icaro.icarobackend.service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.icaro.icarobackend.model.New;
import com.icaro.icarobackend.repository.NewRepository;

// Imports de MongoTemplate
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

@Service
public class NewService {

    private static final Logger logger = LoggerFactory.getLogger(NewService.class);

    private final NewRepository newRepository;
    private final MongoTemplate mongoTemplate;

    public NewService(NewRepository newRepository, MongoTemplate mongoTemplate) {
        this.newRepository = newRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Page<New> findPage(Pageable pageable) {
        logger.info("-------------------- INICIO findPage --------------------");
        logger.info("[Servicio findPage] Pageable RECIBIDO: Página {}, Tamaño {}, Sort {}",
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSort()
        );
        Query query = new Query();
        query.with(pageable);
        logger.info("[Servicio findPage] Query ENVIADA a Mongo: {}", query.toString());
        List<New> list = mongoTemplate.find(query, New.class);
        logger.info("[Servicio findPage] Datos RECIBIDOS (List<New>): {} elementos", list.size());

        if (!list.isEmpty()) {
            String titulos = list.stream()
                    .map(New::getTitle) // O .map(New::getId)
                    .collect(Collectors.joining(", "));
            logger.info("[Servicio findPage] Títulos recibidos: [{}]", titulos);
        }

        Page<New> resultPage = PageableExecutionUtils.getPage(
                list,
                pageable,
                () -> mongoTemplate.count(Query.of(query).limit(-1).skip(-1), New.class)
        );

        logger.info("[Servicio findPage] Page DEVUELTO: Página {}, Total Páginas {}, Total Elementos {}",
                resultPage.getNumber(), // <-- ¡Este es el número CRÍTICO!
                resultPage.getTotalPages(),
                resultPage.getTotalElements()
        );
        logger.info("-------------------- FIN findPage --------------------");

        return resultPage;
    }

    public Page<New> searchNews(String textQuery, Pageable pageable) {
        logger.info("-------------------- INICIO searchNews --------------------");
        logger.info("[Servicio searchNews] Query original: {}", textQuery);

        // 👇 NUEVO: Escapar caracteres especiales de regex
        String escapedQuery = escapeRegexCharacters(textQuery);
        logger.info("[Servicio searchNews] Query escapada: {}", escapedQuery);

        Criteria criteria = new Criteria().orOperator(
                Criteria.where("title").regex(escapedQuery, "i"),
                Criteria.where("description").regex(escapedQuery, "i")
        );

        Query query = new Query(criteria);
        query.with(pageable);

        List<New> list = mongoTemplate.find(query, New.class);

        Page<New> resultPage = PageableExecutionUtils.getPage(
                list,
                pageable,
                () -> mongoTemplate.count(Query.of(query).limit(-1).skip(-1), New.class)
        );

        logger.info("[Servicio searchNews] Page DEVUELTO: {} elementos", resultPage.getTotalElements());
        logger.info("-------------------- FIN searchNews --------------------");

        return resultPage;
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
        logger.info("Servicio: findAll (todas las noticias)");
        return newRepository.findAll();
    }

    public void addNew(New n) {
        logger.info("Servicio: addNew con ID {}", n.getId());
        newRepository.save(n);
    }

    public boolean checkId(String id) {
        return this.newRepository.findById(id).isPresent();
    }

    public Optional<New> findById(String id) {
        logger.info("Servicio: findById {}", id);
        return this.newRepository.findById(id);
    }

    public void removeNewId(String id) {
        logger.info("Servicio: removeNewId {}", id);
        this.newRepository.deleteById(id);
    }

    public List<New> getHighlightedNews() {
        logger.info("Servicio: getHighlightedNews");
        return this.newRepository.findByHighlighted(true);
    }
}