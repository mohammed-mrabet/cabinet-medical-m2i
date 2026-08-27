package ma.oujda.cabinetmedical.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.oujda.cabinetmedical.dto.LoginRequest;
import ma.oujda.cabinetmedical.dto.LoginResponse;
import ma.oujda.cabinetmedical.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
