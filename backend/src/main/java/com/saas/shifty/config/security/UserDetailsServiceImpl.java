package com.saas.shifty.config.security;

import com.saas.shifty.entity.UserAuth;
import com.saas.shifty.repository.UserAuthRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementación de UserDetailsService que carga usuarios desde la tabla users_auth.
 * Spring Security usa este servicio durante la autenticación.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserAuthRepository userAuthRepository;

    /**
     * Carga el usuario por email. Busca en todos los tenants (usado por Spring Security
     * internamente; la validación de tenant se hace en JwtFilter).
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserAuth userAuth = userAuthRepository.findByEmailAndStatus(email, "active")
                .orElseThrow(() -> {
                    log.warn("Usuario no encontrado o inactivo: {}", email);
                    return new UsernameNotFoundException("Usuario no encontrado: " + email);
                });

        return User.builder()
                .username(userAuth.getEmail())
                .password(userAuth.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + userAuth.getRole().toUpperCase())))
                .build();
    }
}
