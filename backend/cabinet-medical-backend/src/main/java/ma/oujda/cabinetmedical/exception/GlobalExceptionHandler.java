package ma.oujda.cabinetmedical.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(CreneauIndisponibleException.class)
    public ResponseEntity<Map<String, Object>> handleCreneauIndisponible(CreneauIndisponibleException ex) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    /**
     * Capture notamment l'erreur Oracle ORA-20001 levée par le trigger
     * trg_rdv_anti_doublon lorsqu'elle remonte sous forme de
     * DataIntegrityViolationException via Spring/Hibernate.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String message = ex.getMostSpecificCause().getMessage();
        if (message != null && message.contains("ORA-20001")) {
            return buildResponse(HttpStatus.CONFLICT,
                    "Créneau déjà pris : ce médecin a déjà un rendez-vous actif à cette date/heure.");
        }
        return buildResponse(HttpStatus.BAD_REQUEST, "Violation de contrainte de données : " + message);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(" | "));
        return buildResponse(HttpStatus.BAD_REQUEST, errors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur interne : " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
