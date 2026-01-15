package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.service.storage.StorageService;
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
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/news")
public class NewController {


    private final NewService newService;
    private final StorageService storageService;

    public NewController(NewService newService, StorageService storageService) {
        this.newService = newService;
        this.storageService = storageService;
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
    public ResponseEntity<Page<New>> getAllNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        // Construimos el Pageable manualmente con tu ordenación deseada
        Sort stableSort = Sort.by(
                Sort.Order.desc("publicationDate"),
                Sort.Order.desc("id")
        );
        
        Pageable pageable = PageRequest.of(page, size, stableSort);
        
        return ResponseEntity.ok(newService.findPage(pageable));
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


    @GetMapping("/Hnews")
    public ResponseEntity<List<New>> getHighlightedNews() {
        List<New> highlightedNews = newService.getHighlightedNews();
        return ResponseEntity.ok(highlightedNews);
    }


    // ---------- METODOS CON VERIFICACION -------------

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file
    ) {
        // 1. Buscar la noticia
        Optional<New> newsOptional = newService.findById(id);
        if (newsOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        New newsItem = newsOptional.get();

        // 2. Obtener y limpiar el nombre original
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        
        // Si el nombre es muy largo (ej: más de 50 caracteres), rechazamos
        if (originalFilename.length() > 50) {
            return ResponseEntity.badRequest()
                .body("El nombre del archivo es demasiado largo (máx 50 caracteres). Por favor, renómbralo.");
        }
        
        // Comprobación de seguridad básica (que no esté vacío o tenga caracteres raros)
        if (originalFilename.contains("..")) {
             return ResponseEntity.badRequest().body("Nombre de archivo inválido.");
        }

        try {
            // 3. Guardar el archivo usando el nombre original
            // Se guardará en: /app/uploads/news/foto-conferencia.jpg
            storageService.store(file, "news", originalFilename);

            // 4. ACTUALIZAR LA BASE DE DATOS
            // Guardamos el nombre en la entidad para que el frontend sepa cuál cargar
            newsItem.setImageName(originalFilename);
            newService.save(newsItem); 

            return ResponseEntity.ok().body("Imagen subida: " + originalFilename);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al subir la imagen: " + e.getMessage());
        }
    }

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