package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.dto.NewsDTO;
import com.icaro.icarobackend.model.New;
import com.icaro.icarobackend.service.NewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/news")
public class NewController {

    NewService newService;

    private String uploadDir = "src/main/resources/static/assets/news";


    public NewController(NewService newService) {
        this.newService = newService;
    }

    // ---------- METODOS SIN VERIFICACION -------------


    @GetMapping("/all")
    public ResponseEntity<List<New>> findAll(){
        return ResponseEntity.ok().body(newService.findAll());
    }

    // Devuelve la información del page seleccionado
    @GetMapping("/page")
    public Page<New> getAllNews(Pageable pageable) {
        return newService.findPage(pageable);
    }

    // Devuelve la informacion de un New en caso de que no esté en el page.
    @GetMapping("/search")
    public ResponseEntity<Page<NewsDTO>> searchNews(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<NewsDTO> results = newService.searchNews(query, pageable);
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/check-image/{id}")
    public ResponseEntity<Map<String, Object>> checkImageExists(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();

        String[] extensions = {"jpg", "png", "webp"};
        String foundExtension = null;

        for (String ext : extensions) {
            Path imagePath = Paths.get(uploadDir, id + "." + ext);
            if (Files.exists(imagePath)) {
                foundExtension = ext;
                break;
            }
        }
        log.info("Check image exists for id {}", id);
        response.put("exists", foundExtension != null);
        response.put("extension", foundExtension);
        response.put("imageUrl", foundExtension != null ?
                "/assets/news/" + id + "." + foundExtension :
                "/assets/news/default.jpg");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/Hnews")
    public ResponseEntity<List<New>> getHighlightedNews(){
        return ResponseEntity.ok().body(newService.getHighlightedNews());
    }

    // ---------- METODOS CON VERIFICACION -------------


    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody New n){
        if(this.newService.findById(n.getId()).isEmpty()){
            this.newService.addNew(n);
            log.info("Creando news" + n );
            return ResponseEntity.status(HttpStatus.CREATED).body(n);
        }else{
            return ResponseEntity.status(HttpStatus.CONFLICT).body(n);
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id){
        if(this.newService.findById(id).isEmpty()){
            log.info("Eliminando news" + id );
            return ResponseEntity.status(HttpStatus.CONFLICT).body(id);
        }else{
            this.newService.removeNewId(id);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(id);
        }
    }

    @PostMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> findById(@RequestBody New n){
        this.newService.addNew(n);
        return ResponseEntity.status(HttpStatus.CREATED).body(n);
    }

    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> save(@RequestBody New n){
        this.newService.addNew(n);
        log.info("Guardando news" + n );
        return ResponseEntity.status(HttpStatus.CREATED).body(n);
    }


}
