package ru.musicunity.backend.repository;

import ru.musicunity.backend.model.RegistrationRequest;
import ru.musicunity.backend.pojo.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {

    // Найти заявку по email
    Optional<RegistrationRequest> findByEmail(String email);

    // Найти заявки по статусу
    Page<RegistrationRequest> findByStatus(RequestStatus status, Pageable pageable);

    // Найти все заявки, отсортированные по дате создания
    Page<RegistrationRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Проверить, есть ли активная заявка у пользователя (по email)
    boolean existsByEmailAndStatus(String email, RequestStatus status);

    // Найти заявки по статусу, отсортированные по дате
    Page<RegistrationRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status, Pageable pageable);
} 