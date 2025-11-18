package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.dto.NewsImageDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;

import com.icaro.icarobackend.model.New;
import com.icaro.icarobackend.service.NewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/news")
public class NewController {


    private final NewService newService;

    public NewController(NewService newService) {
        this.newService = newService;
    }

    // ---------- METODOS SIN VERIFICACION -------------


    @GetMapping("/all")
    public ResponseEntity<List<New>> findAll() {
        return ResponseEntity.ok().body(newService.findAll());
    }

    @GetMapping("/check/{id}")
    public ResponseEntity<Boolean> checkNewsId(@PathVariable String id) {
        boolean exists = newService.findById(id).isPresent();
        if (exists) {
            return ResponseEntity.ok(true);
        } else {
            return ResponseEntity.status(404).body(false);
        }
    }

    /**
     * Devuelve la información del page seleccionado.
     */
    @GetMapping("/page")
    public Page<New> getAllNews(Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            Sort stableSort = Sort.by(
                    Order.desc("publicationDate"),
                    Order.desc("id")
            );

            pageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    stableSort
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
            @RequestParam(defaultValue = "10") int size) {
        Sort stableSort = Sort.by(
                Order.desc("publicationDate"),
                Order.desc("id")
        );
        Pageable pageable = PageRequest.of(
                page,
                size,
                stableSort
        );

        Page<New> results = newService.searchNews(query, pageable);

        return ResponseEntity.ok(results);
    }

    // Imagen en el carousel

    @GetMapping("/Hnews")
    public ResponseEntity<List<New>> getHighlightedNews() {
        List<New> highlightedNews = newService.getHighlightedNews();
        return ResponseEntity.ok(highlightedNews);
    }

    @GetMapping("/check-image/{newsId}")
    public ResponseEntity<NewsImageDTO> checkNewsImage(@PathVariable String newsId) {
        NewsImageDTO response = newService.checkNewsImage(newsId);
        return ResponseEntity.ok(response);
    }

    // ---------- METODOS CON VERIFICACION -------------


    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<New> addNew(@RequestBody New newData) {
        if (this.newService.addNew(newData)) {
            return new ResponseEntity<>(newData, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(newData, HttpStatus.CONFLICT);
        }
    }

    @PostMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<New> update(@RequestBody New news) {
        if (this.newService.updateNew(news)) {
            return new ResponseEntity<>(news, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @DeleteMapping("/delete/{newsId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<New> delete(@PathVariable("newsId") String newsId) {
        if(this.newService.deleteNew(newsId)){
            return new ResponseEntity<>(HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }
}