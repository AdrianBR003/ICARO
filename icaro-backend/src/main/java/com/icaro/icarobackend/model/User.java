package com.icaro.icarobackend.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Builder
@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String passwordHash;
    private boolean isAdmin;
}
