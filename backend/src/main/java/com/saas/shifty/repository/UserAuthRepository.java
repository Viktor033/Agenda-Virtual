package com.saas.shifty.repository;

import com.saas.shifty.entity.UserAuth;
import com.saas.shifty.entity.UserAuthId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAuthRepository extends JpaRepository<UserAuth, UserAuthId> {

    /**
     * Busca un usuario activo por email dentro de un tenant específico.
     */
    Optional<UserAuth> findByEmailAndId_TenantIdAndStatus(String email, Long tenantId, String status);

    /**
     * Busca un usuario activo por email en cualquier tenant.
     * Usado para el login del Super Admin (tenant_id = 0 o especial).
     */
    Optional<UserAuth> findByEmailAndStatus(String email, String status);
}
