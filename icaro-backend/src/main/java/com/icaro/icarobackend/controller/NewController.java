package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.New;
import com.icaro.icarobackend.service.NewService;
import lombok.extern.slf4j.Slf4j;
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

    @GetMapping("/check-image/{orcid}")
    public ResponseEntity<Map<String, Object>> checkImageExists(@PathVariable String orcid) {
        Map<String, Object> response = new HashMap<>();

        String[] extensions = {"jpg", "png", "webp"};
        String foundExtension = null;

        for (String ext : extensions) {
            Path imagePath = Paths.get(uploadDir, "img_" + orcid + "." + ext);
            if (Files.exists(imagePath)) {
                foundExtension = ext;
                break;
            }
        }

        response.put("exists", foundExtension != null);
        response.put("extension", foundExtension);
        response.put("imageUrl", foundExtension != null ?
                "/static/assets/people/img_" + orcid + "." + foundExtension :
                "/static/assets/people/default.jpg");

        return ResponseEntity.ok(response);
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
