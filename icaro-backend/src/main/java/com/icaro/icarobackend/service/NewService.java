package com.icaro.icarobackend.service;

import com.icaro.icarobackend.model.New;
import com.icaro.icarobackend.repository.NewRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NewService {

    NewRepository newRepository;

    public NewService(NewRepository newRepository) {
        this.newRepository = newRepository;
    }

    public List<New> findAll(){
        return newRepository.findAll();
    }

    public void addNew(New n){
        newRepository.save(n);
    }

    public Optional<New> findById(String id){
        return this.newRepository.findById(id);
    }

    public void removeNewId(String id){
        this.newRepository.deleteById(id);
    }

}
