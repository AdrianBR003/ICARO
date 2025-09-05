package com.icaro.icarobackend.controller;

import com.icaro.icarobackend.model.New;
import com.icaro.icarobackend.service.NewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

}
