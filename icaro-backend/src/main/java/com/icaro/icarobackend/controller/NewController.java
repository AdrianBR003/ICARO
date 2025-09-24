package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.New;
import com.icaro.icarobackend.service.NewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/news")
public class NewController {

    NewService newService;

    public NewController(NewService newService) {
        this.newService = newService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<New>> findAll(){
        return ResponseEntity.ok().body(newService.findAll());
    }

    @PostMapping("/{id}")
    public ResponseEntity<?> findById(@RequestBody New n){
        this.newService.addNew(n);
        return ResponseEntity.status(HttpStatus.CREATED).body(n);
    }

    @PostMapping("/save")
    public ResponseEntity<?> save(@RequestBody New n){
        this.newService.addNew(n);
        log.info("Guardando news" + n );
        return ResponseEntity.status(HttpStatus.CREATED).body(n);
    }

    @PostMapping("/create")
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
    public ResponseEntity<?> delete(@PathVariable String id){
        if(this.newService.findById(id).isEmpty()){
            log.info("Eliminando news" + id );
            return ResponseEntity.status(HttpStatus.CONFLICT).body(id);
        }else{
            this.newService.removeNewId(id);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(id);
        }
    }
}
