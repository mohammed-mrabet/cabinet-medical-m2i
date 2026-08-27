package ma.oujda.cabinetmedical.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Intercepte chaque requête HTTP, extrait le token JWT de l'en-tête
 * Authorization, et alimente le SecurityContext si le token est valide.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null && jwtUtils.validateToken(token)) {
            String login = jwtUtils.getLoginFromToken(token);
            String authoritiesStr = jwtUtils.getAuthoritiesFromToken(token);
            Long personneId = jwtUtils.getPersonneIdFromToken(token);

            List<GrantedAuthority> authorities = Arrays.stream(authoritiesStr.split(","))
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(login, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // On expose aussi le personneId métier pour les contrôleurs
            // (ex: filtrer "mes RDV" sans qu'un patient passe l'ID d'un autre)
            request.setAttribute("personneId", personneId);

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
