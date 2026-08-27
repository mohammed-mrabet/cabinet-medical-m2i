package ma.oujda.cabinetmedical.service;

import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.dto.LoginRequest;
import ma.oujda.cabinetmedical.dto.LoginResponse;
import ma.oujda.cabinetmedical.entity.Utilisateur;
import ma.oujda.cabinetmedical.repository.oracle.UtilisateurRepository;
import ma.oujda.cabinetmedical.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final JwtUtils jwtUtils;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getMotDePasse())
        );

        Utilisateur utilisateur = utilisateurRepository.findByLogin(request.getLogin())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable après authentification"));

        String token = jwtUtils.generateToken(authentication, utilisateur.getPersonneId());

        return LoginResponse.builder()
                .token(token)
                .login(utilisateur.getLogin())
                .role(utilisateur.getRole().name())
                .personneId(utilisateur.getPersonneId())
                .build();
    }
}
