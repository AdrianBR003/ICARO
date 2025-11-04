package com.icaro.icarobackend.controller; // Asegúrate que el package sea correcto

// Imports para el Sort.Order
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;

import com.icaro.icarobackend.model.New;
import com.icaro.icarobackend.service.NewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/news")
public class NewController {

    private static final Logger logger = LoggerFactory.getLogger(NewController.class);

    private final NewService newService;

    public NewController(NewService newService) {
        this.newService = newService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<New>> findAll(){
        return ResponseEntity.ok().body(newService.findAll());
    }

    /**
     * Devuelve la información del page seleccionado.
     */
    @GetMapping("/page")
    public Page<New> getAllNews(Pageable pageable) {
        // Log de la petición de entrada
        logger.info("--- REQUEST /page ---");
        logger.info("Página solicitada: {}", pageable.getPageNumber());
        logger.info("Tamaño de página: {}", pageable.getPageSize());
        logger.info("Ordenación (entrante): {}", pageable.getSort());
        logger.info("---------------------");

        // Se comprueba si el cliente (frontend) ha solicitado un orden
        if (pageable.getSort().isUnsorted()) {

            // (CORREGIDO)
            // Se crea una ordenación ESTABLE de 2 niveles:
            // 1. Por fecha (DESC)
            // 2. Por ID (DESC) para romper empates
            Sort stableSort = Sort.by(
                    Order.desc("publicationDate"),
                    Order.desc("id") // O Order.asc("id"), como prefieras
            );

            pageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    stableSort // Se usa la ordenación estable
            );
        }
        return newService.findPage(pageable);
    }

    /**
     * Devuelve una página (Page<New>) de resultados de búsqueda.
     */
    @GetMapping("/search")
    public ResponseEntity<Page<New>> searchNews(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) { // 50 era mucho, 10 o 50 está bien

        logger.info("--- REQUEST /search ---");
        logger.info("Query: {}", query);
        logger.info("Página solicitada: {}", page);
        logger.info("Tamaño de página: {}", size);
        logger.info("-----------------------");

        // (CORREGIDO)
        // Se crea la ordenación ESTABLE también para la búsqueda
        Sort stableSort = Sort.by(
                Order.desc("publicationDate"),
                Order.desc("id")
        );

        Pageable pageable = PageRequest.of(
                page,
                size,
                stableSort // Se usa la ordenación estable
        );

        Page<New> results = newService.searchNews(query, pageable);

        return ResponseEntity.ok(results);
    }
}