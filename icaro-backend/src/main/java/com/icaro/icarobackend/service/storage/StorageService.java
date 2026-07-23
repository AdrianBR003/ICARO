package com.icaro.icarobackend.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class StorageService {

    private final Path rootLocation;

    public StorageService(@Value("${app.storage.location}") String storageLocation) {
        this.rootLocation = Paths.get(storageLocation);
        init();
    }

    public void init() {
        try {
            Files.createDirectories(rootLocation.resolve("news"));
        } catch (IOException e) {
            throw new RuntimeException("No se pudo inicializar la carpeta de uploads", e);
        }
    }

    public String store(MultipartFile file, String folder, String filename) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Fallo al guardar archivo vacío.");
            }
            
            // Construimos la ruta destino: /app/uploads/news/nombre-original.jpg
            Path destinationFile = this.rootLocation.resolve(folder)
                    .resolve(Paths.get(filename))
                    .normalize()
                    .toAbsolutePath();

            // Seguridad extra: verificar que estamos escribiendo dentro de la carpeta permitida
            if (!destinationFile.getParent().equals(this.rootLocation.resolve(folder).normalize())) {
                throw new RuntimeException("No se puede guardar el archivo fuera del directorio actual.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Fallo al guardar el archivo.", e);
        }
    }
}