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

        // 1. Se crea la query vacía (equivale a "{}")
        Query query = new Query();

        // 2. Se aplica el Pageable (skip, limit, sort)
        query.with(pageable);

        // 3. Se imprime la query exacta que se enviará a Mongo
        logger.info("[Servicio findPage] Query ENVIADA a Mongo: {}", query.toString());

        // 4. Se ejecuta la búsqueda
        List<New> list = mongoTemplate.find(query, New.class);

        // 5. Se imprimen los resultados crudos recibidos
        logger.info("[Servicio findPage] Datos RECIBIDOS (List<New>): {} elementos", list.size());

        if (!list.isEmpty()) {
            String titulos = list.stream()
                    .map(New::getTitle) // O .map(New::getId)
                    .collect(Collectors.joining(", "));
            logger.info("[Servicio findPage] Títulos recibidos: [{}]", titulos);
        }

        // 6. Se crea el objeto Page
        // (Se usa una función lambda para el 'count' para que solo se ejecute si es necesario)
        Page<New> resultPage = PageableExecutionUtils.getPage(
                list,
                pageable,
                () -> mongoTemplate.count(Query.of(query).limit(-1).skip(-1), New.class)
        );

        // 7. (LOG NUEVO) Se imprime el Page final que se devuelve al Controller
        logger.info("[Servicio findPage] Page DEVUELTO: Página {}, Total Páginas {}, Total Elementos {}",
                resultPage.getNumber(), // <-- ¡Este es el número CRÍTICO!
                resultPage.getTotalPages(),
                resultPage.getTotalElements()
        );
        logger.info("-------------------- FIN findPage --------------------");

        return resultPage;
    }

    /**
     * (REESCRITO CON MONGO TEMPLATE + LOGS DETALLADOS)
     */
    public Page<New> searchNews(String textQuery, Pageable pageable) {
        logger.info("-------------------- INICIO searchNews --------------------");
        logger.info("[Servicio searchNews] Pageable RECIBIDO: Página {}, Tamaño {}, Sort {}",
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSort()
        );
        logger.info("[Servicio searchNews] Query: {}", textQuery);

        // 1. Criterio de búsqueda
        Criteria criteria = new Criteria().orOperator(
                Criteria.where("title").regex(textQuery, "i"),
                Criteria.where("description").regex(textQuery, "i")
        );

        // 2. Query con criterio
        Query query = new Query(criteria);

        // 3. Se aplica Pageable
        query.with(pageable);

        // 4. (LOG NUEVO)
        logger.info("[Servicio searchNews] Query ENVIADA a Mongo: {}", query.toString());

        // 5. Ejecutar
        List<New> list = mongoTemplate.find(query, New.class);

        // 6. (LOG NUEVO)
        logger.info("[Servicio searchNews] Datos RECIBIDOS (List<New>): {} elementos", list.size());
        if (!list.isEmpty()) {
            String titulos = list.stream()
                    .map(New::getTitle)
                    .collect(Collectors.joining(", "));
            logger.info("[Servicio searchNews] Títulos recibidos: [{}]", titulos);
        }

        // 7. Crear Page
        Page<New> resultPage = PageableExecutionUtils.getPage(
                list,
                pageable,
                () -> mongoTemplate.count(Query.of(query).limit(-1).skip(-1), New.class)
        );

        // 8. (LOG NUEVO)
        logger.info("[Servicio searchNews] Page DEVUELTO: Página {}, Total Páginas {}, Total Elementos {}",
                resultPage.getNumber(), // <-- ¡Número CRÍTICO!
                resultPage.getTotalPages(),
                resultPage.getTotalElements()
        );
        logger.info("-------------------- FIN searchNews --------------------");

        return resultPage;
    }

    // --- MÉTODOS SIMPLES (usan el Repositorio) ---

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