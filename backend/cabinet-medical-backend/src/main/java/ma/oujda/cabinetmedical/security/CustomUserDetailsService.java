package ma.oujda.cabinetmedical.security;

import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.entity.Utilisateur;
import ma.oujda.cabinetmedical.repository.oracle.UtilisateurRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Charge un utilisateur depuis Oracle (table UTILISATEUR) pour
 * l'authentification Spring Security. Le rôle métier (MEDECIN/PATIENT)
 * est traduit en autorité Spring "ROLE_MEDECIN" / "ROLE_PATIENT".
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + login));

        if (!utilisateur.isActif()) {
            throw new UsernameNotFoundException("Compte désactivé : " + login);
        }

        return User.builder()
                .username(utilisateur.getLogin())
                .password(utilisateur.getMotDePasse())
                .authorities(List.of(() -> "ROLE_" + utilisateur.getRole().name()))
                .build();
    }
}
