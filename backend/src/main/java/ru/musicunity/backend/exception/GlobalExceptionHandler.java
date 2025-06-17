package ru.musicunity.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.thymeleaf.exceptions.TemplateInputException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<?> handleNotFound() {
        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", "Запрошенный ресурс не найден");
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(TemplateInputException.class)
    public ResponseEntity<?> handleTemplateError() {
        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Internal Server Error");
        body.put("message", "Ошибка при обработке шаблона");
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Доступ запрещен: {}", ex.getMessage());
        
        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Forbidden");
        body.put("message", "Доступ запрещен");
        body.put("timestamp", LocalDateTime.now());
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        ApiError apiError = new ApiError(
                HttpStatus.BAD_REQUEST, 
                "Ошибка валидации", 
                errors
        );
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Object> handleBadCredentials() {
        ApiError apiError = new ApiError(
                HttpStatus.UNAUTHORIZED, 
                "Неверное имя пользователя или пароль", 
                null
        );
        
        return new ResponseEntity<>(apiError, HttpStatus.UNAUTHORIZED);
    }
    
    @ExceptionHandler({DisabledException.class, LockedException.class})
    public ResponseEntity<Object> handleAccountDisabled() {
        ApiError apiError = new ApiError(
                HttpStatus.FORBIDDEN, 
                "Учетная запись заблокирована или деактивирована", 
                null
        );
        
        return new ResponseEntity<>(apiError, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Object> handleEntityNotFound(EntityNotFoundException ex) {
        ApiError apiError = new ApiError(
                HttpStatus.NOT_FOUND, 
                ex.getMessage(), 
                null
        );
        
        return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
    }

    // Обработчики ошибок загрузки файлов
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<Object> handleMultipartException(MultipartException ex, HttpServletRequest request) {
        log.error("Ошибка при обработке multipart запроса: {}", ex.getMessage());
        
        Map<String, Object> details = new HashMap<>();
        details.put("url", request.getRequestURL().toString());
        
        ApiError apiError = new ApiError(
                HttpStatus.BAD_REQUEST, 
                "Ошибка при загрузке файла: " + ex.getMessage(), 
                details
        );
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Object> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        log.error("Превышен максимальный размер загружаемого файла: {}", ex.getMessage());
        
        ApiError apiError = new ApiError(
                HttpStatus.BAD_REQUEST, 
                "Превышен максимальный размер файла (5MB)", 
                null
        );
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgument(IllegalArgumentException ex) {
        log.error("Некорректный аргумент: {}", ex.getMessage());
        
        ApiError apiError = new ApiError(
                HttpStatus.BAD_REQUEST, 
                ex.getMessage(), 
                null
        );
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(Exception ex) {
        log.error("Непредвиденная ошибка: ", ex);
        
        ApiError apiError = new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "Произошла внутренняя ошибка сервера", 
                null
        );
        
        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    public static class ApiError {
        private HttpStatus status;
        private String message;
        private Map<String, Object> errors;
        private LocalDateTime timestamp;
        
        public ApiError(HttpStatus status, String message, Map<String, Object> errors) {
            this.status = status;
            this.message = message;
            this.errors = errors;
            this.timestamp = LocalDateTime.now();
        }
        
        public HttpStatus getStatus() {
            return status;
        }
        
        public String getMessage() {
            return message;
        }
        
        public Map<String, Object> getErrors() {
            return errors;
        }
        
        public LocalDateTime getTimestamp() {
            return timestamp;
        }
    }
} 