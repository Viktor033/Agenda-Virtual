package com.saas.shifty.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Mapea la tabla users_auth del schema.
 * Clave primaria compuesta (tenant_id, id) según el diseño multi-tenant.
 */
@Entity
@Table(name = "users_auth")
@Getter
@Setter
@NoArgsConstructor
public class UserAuth {

    @EmbeddedId
    private UserAuthId id;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "role", nullable = false, length = 30)
    private String role = "staff";

    @Column(name = "status", length = 20)
    private String status = "active";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
