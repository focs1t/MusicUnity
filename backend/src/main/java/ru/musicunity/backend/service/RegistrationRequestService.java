package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.musicunity.backend.dto.RegistrationRequestDTO;
import ru.musicunity.backend.pojo.Author;
import ru.musicunity.backend.model.RegistrationRequest;
import ru.musicunity.backend.pojo.User;
import ru.musicunity.backend.pojo.Review;
import ru.musicunity.backend.pojo.Report;
import ru.musicunity.backend.pojo.enums.RequestStatus;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.repository.AuthorRepository;
import ru.musicunity.backend.repository.RegistrationRequestRepository;
import ru.musicunity.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationRequestService {

    private final RegistrationRequestRepository registrationRequestRepository;
    private final UserRepository userRepository;
    private final AuthorRepository authorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Transactional
    public RegistrationRequestDTO submitAuthorRegistrationRequest(String email, String username, String password, String authorName) {
        // Проверяем, нет ли уже пользователя с таким email или username
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }

        // Проверяем, нет ли активной заявки с таким email
        if (registrationRequestRepository.existsByEmailAndStatus(email, RequestStatus.PENDING)) {
            throw new RuntimeException("У вас уже есть активная заявка на регистрацию");
        }

        // Создаем заявку
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail(email);
        request.setUsername(username);
        request.setPassword(passwordEncoder.encode(password)); // Сразу хешируем пароль
        request.setAuthorName(authorName); // Имя автора
        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());

        RegistrationRequest savedRequest = registrationRequestRepository.save(request);
        log.info("Создана заявка на регистрацию автора: {}", savedRequest.getRequestId());

        // Отправляем уведомление админам
        sendAdminNotification(savedRequest);

        return convertToDTO(savedRequest);
    }

    @Transactional
    public RegistrationRequestDTO approveRequest(Long requestId, String adminComment, String adminEmail) {
        RegistrationRequest request = registrationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Заявка уже была обработана");
        }

        // Проверяем, что пользователь с таким email/username еще не создан
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }

        // Создаем пользователя
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(request.getPassword()); // Пароль уже захеширован
        user.setRights(UserRole.AUTHOR);
        user.setIsBlocked(false);
        user.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        // Создаем автора (базовый профиль, будет заполнен позже)
        Author author = new Author();
        author.setAuthorName(request.getAuthorName() != null ? request.getAuthorName() : savedUser.getUsername()); // Используем имя автора из заявки или username
        author.setBio("Автор, подтвержденный через заявку");
        author.setAvatarUrl(null);
        author.setIsVerified(true); // Автоматически верифицируем при создании через заявку
        author.setUser(savedUser);
        author.setCreatedAt(LocalDateTime.now());
        authorRepository.save(author);

        // Обновляем заявку
        request.setStatus(RequestStatus.APPROVED);
        request.setProcessedAt(LocalDateTime.now());
        request.setAdminComment(adminComment);
        request.setAdminEmail(adminEmail);
        RegistrationRequest updatedRequest = registrationRequestRepository.save(request);

        log.info("Заявка {} одобрена, создан пользователь {} и автор {}", requestId, savedUser.getUserId(), author.getAuthorId());

        // Отправляем уведомление пользователю
        sendApprovalNotification(updatedRequest);

        return convertToDTO(updatedRequest);
    }

    @Transactional
    public RegistrationRequestDTO rejectRequest(Long requestId, String adminComment, String adminEmail) {
        RegistrationRequest request = registrationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Заявка не найдена"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Заявка уже была обработана");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setProcessedAt(LocalDateTime.now());
        request.setAdminComment(adminComment);
        request.setAdminEmail(adminEmail);
        RegistrationRequest updatedRequest = registrationRequestRepository.save(request);

        log.info("Заявка {} отклонена", requestId);

        // Отправляем уведомление пользователю
        sendRejectionNotification(updatedRequest);

        return convertToDTO(updatedRequest);
    }

    public Page<RegistrationRequestDTO> getAllRequests(Pageable pageable) {
        return registrationRequestRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::convertToDTO);
    }

    public Page<RegistrationRequestDTO> getRequestsByStatus(RequestStatus status, Pageable pageable) {
        return registrationRequestRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                .map(this::convertToDTO);
    }

    public Optional<RegistrationRequestDTO> getRequestById(Long requestId) {
        return registrationRequestRepository.findById(requestId)
                .map(this::convertToDTO);
    }

    private void sendAdminNotification(RegistrationRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("admin@musicunity.ru"); // Email админа
            message.setFrom(fromEmail);
            message.setSubject("Новая заявка на регистрацию автора");
            message.setText(String.format(
                "Получена новая заявка на регистрацию автора:\n\n" +
                "Email: %s\n" +
                "Имя пользователя: %s\n\n" +
                "Пользователь должен написать на musicunity@mail.ru " +
                "для подтверждения статуса автора с доказательствами музыкальных работ.\n\n" +
                "Для обработки заявки перейдите в админ панель.",
                request.getEmail(),
                request.getUsername()
            ));
            mailSender.send(message);
            log.info("Отправлено уведомление админу о новой заявке {}", request.getRequestId());
        } catch (Exception e) {
            log.error("Ошибка отправки уведомления админу: {}", e.getMessage());
        }
    }

    private void sendApprovalNotification(RegistrationRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(request.getEmail());
            message.setFrom(fromEmail);
            message.setSubject("Ваша заявка на регистрацию автора одобрена!");
            message.setText(String.format(
                "Поздравляем!\n\n" +
                "Ваша заявка на регистрацию в качестве автора была одобрена.\n" +
                "Теперь вы можете войти в систему используя:\n\n" +
                "Имя пользователя: %s\n" +
                "Пароль: тот же, что вы указали при подаче заявки\n\n" +
                "%s\n\n" +
                "Добро пожаловать в MusicUnity!",
                request.getUsername(),
                request.getAdminComment() != null ? "Комментарий от администратора: " + request.getAdminComment() : ""
            ));
            mailSender.send(message);
            log.info("Отправлено уведомление об одобрении заявки {}", request.getRequestId());
        } catch (Exception e) {
            log.error("Ошибка отправки уведомления об одобрении: {}", e.getMessage());
        }
    }

    private void sendRejectionNotification(RegistrationRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(request.getEmail());
            message.setFrom(fromEmail);
            message.setSubject("Ваша заявка на регистрацию автора отклонена");
            message.setText(String.format(
                "К сожалению, ваша заявка на регистрацию в качестве автора была отклонена.\n\n" +
                "%s\n\n" +
                "Вы можете подать новую заявку позже.",
                request.getAdminComment() != null ? "Причина: " + request.getAdminComment() : ""
            ));
            mailSender.send(message);
            log.info("Отправлено уведомление об отклонении заявки {}", request.getRequestId());
        } catch (Exception e) {
            log.error("Ошибка отправки уведомления об отклонении: {}", e.getMessage());
        }
    }

    private RegistrationRequestDTO convertToDTO(RegistrationRequest request) {
        RegistrationRequestDTO dto = new RegistrationRequestDTO();
        dto.setRequestId(request.getRequestId());
        dto.setEmail(request.getEmail());
        dto.setUsername(request.getUsername());
        dto.setAuthorName(request.getAuthorName());
        dto.setStatus(request.getStatus());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setProcessedAt(request.getProcessedAt());
        dto.setAdminComment(request.getAdminComment());
        dto.setAdminEmail(request.getAdminEmail());
        return dto;
    }
} 