package com.icaro.icarobackend.service;

import com.icaro.icarobackend.model.Work;
import com.icaro.icarobackend.model.Investigator;
import com.icaro.icarobackend.repository.WorkRepository;
import com.icaro.icarobackend.repository.InvestigatorRepository;
import com.icaro.icarobackend.service.orcid.OrcidService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class InvestigatorService {

    private final InvestigatorRepository investigatorRepository;
    private final WorkRepository workRepository;
    // Direccion Imagenes Investigators (People)
    private final Path rootLocation = Paths.get("/app/uploads/people");


    public InvestigatorService(InvestigatorRepository investigatorRepository,
                               WorkRepository workRepository) {
        this.investigatorRepository = investigatorRepository;
        this.workRepository = workRepository;
    }


    public Investigator updateInvestigator(String orcid, Investigator investigator) {
        Investigator existing = investigatorRepository.findById(orcid)
                .orElseThrow(() -> new RuntimeException("Investigador no encontrado: " + orcid));

        existing.setGivenNames(investigator.getGivenNames());
        existing.setFamilyName(investigator.getFamilyName());
        existing.setEmail(investigator.getEmail());
        existing.setRole(investigator.getRole());
        existing.setOffice(investigator.getOffice());
        existing.setPhone(investigator.getPhone());
        existing.setBiography(investigator.getBiography());
        
        if (investigator.getImageName() != null && !investigator.getImageName().isEmpty()) {
            existing.setImageName(investigator.getImageName());
        }

        // 4. Guardamos la entidad modificada
        return investigatorRepository.save(existing);
    }

    public Page<Investigator> getInvestigatorsPaged(String query, Pageable pageable) {
        if (query != null && !query.trim().isEmpty()) {
            // Buscamos lo mismo en nombre O apellido
            return investigatorRepository.findByGivenNamesContainingIgnoreCaseOrFamilyNameContainingIgnoreCase(
                    query, query, pageable);
        }
        return investigatorRepository.findAll(pageable);
    }

    public List<Investigator> getAllInvestigator(){
        log.info("getAllInvestigator");
        return investigatorRepository.findAll();
    }

    public Investigator saveInvestigator(Investigator investigator) {
        return investigatorRepository.save(investigator);
    }

    public Optional<Investigator> findInvestigatorbyOID(String oid){
        log.info("findInvestigatorbyOID");
        return this.investigatorRepository.findById(oid);
    }

    public void deleteInvestigator(String orcid) {
        investigatorRepository.deleteById(orcid);
    }


    public boolean uploadImage(String id, MultipartFile file) {
        try {
            // 1. Verificar si la persona existe
            Optional<Investigator> personOpt = investigatorRepository.findById(id);
            if (personOpt.isEmpty()) {
                return false;
            }
            Investigator investigator = personOpt.get();

            // 2. Crear el directorio si no existe
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }

            // 3. Generar nombre único (ID + extensión original o .jpg)
            // Usamos el nombre original para mantener la extensión, o forzamos una.
            // Opción recomendada: Limpiar el nombre original
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                extension = ".jpg"; // fallback
            }

            // Ejemplo nombre: "person-12345.jpg"
            String newFileName = "person-" + id + extension;

            // 4. Guardar archivo físico (reemplaza si existe)
            Files.copy(file.getInputStream(),
                    this.rootLocation.resolve(newFileName),
                    StandardCopyOption.REPLACE_EXISTING);

            // 5. Actualizar la BD con el nombre del archivo
            investigator.setImageName(newFileName);
            investigatorRepository.save(investigator);

            return true;

        } catch (IOException e) {
            e.printStackTrace(); // O usa un Logger
            return false;
        }
    }
}
