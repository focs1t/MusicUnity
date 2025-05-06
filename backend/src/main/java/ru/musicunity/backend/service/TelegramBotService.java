package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.User;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;
import ru.musicunity.backend.pojo.enums.UserRole;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TelegramBotService extends TelegramLongPollingBot {
    private final UserService userService;

    @Value("${telegram.bot.username}")
    private String botUsername;

    @Value("${telegram.bot.token}")
    private String botToken;

    private final Map<String, Long> pendingLinks = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        try {
            TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
            botsApi.registerBot(this);
        } catch (TelegramApiException e) {
            throw new RuntimeException("Failed to register Telegram bot", e);
        }
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            Long chatId = update.getMessage().getChatId();

            if (messageText.startsWith("/start ")) {
                String token = messageText.substring(7).trim();
                handleStartCommand(chatId, token);
            } else if (messageText.equals("/unlink")) {
                handleUnlinkCommand(chatId);
            }
        }
    }

    private void handleStartCommand(Long chatId, String token) {
        String message;
        try {
            if (pendingLinks.containsKey(token)) {
                pendingLinks.put(token, chatId);
                message = "✅ Ваш аккаунт успешно привязан к Telegram!\n\n" +
                         "Теперь вы будете получать уведомления о новых жалобах.";
            } else {
                message = "❌ Неверная ссылка для привязки.\n\n" +
                         "Пожалуйста, используйте ссылку из веб-интерфейса.";
            }
        } catch (Exception e) {
            message = "❌ Произошла ошибка при привязке аккаунта.\n\n" +
                     "Пожалуйста, попробуйте позже или обратитесь к администратору.";
        }

        sendMessage(chatId, message);
    }

    private void handleUnlinkCommand(Long chatId) {
        String message;
        try {
            ru.musicunity.backend.pojo.User user = userService.findByTelegramChatId(chatId);
            if (user != null) {
                userService.updateTelegramChatId(user.getUsername(), null);
                message = "✅ Ваш аккаунт успешно отвязан от Telegram.";
            } else {
                message = "❌ Ваш аккаунт не привязан к Telegram.";
            }
        } catch (Exception e) {
            message = "❌ Произошла ошибка при отвязке аккаунта.\n\n" +
                     "Пожалуйста, попробуйте позже или обратитесь к администратору.";
        }

        sendMessage(chatId, message);
    }

    public void notifyModeratorsAboutNewReport(String reportId, String reportType, String reportContent) {
        List<ru.musicunity.backend.pojo.User> moderators = userService.findByRights(UserRole.MODERATOR);
        
        String message = String.format(
            "🔔 Новое обращение #%s\n\nТип: %s\nСодержание: %s",
            reportId, reportType, reportContent
        );

        for (ru.musicunity.backend.pojo.User moderator : moderators) {
            if (moderator.getTelegramChatId() != null) {
                sendMessage(moderator.getTelegramChatId(), message);
            }
        }
    }

    public String generateLinkToken(String username) {
        String token = java.util.UUID.randomUUID().toString();
        pendingLinks.put(token, null); // chatId будет установлен позже
        return "https://t.me/" + botUsername + "?start=" + token;
    }

    private void sendMessage(Long chatId, String text) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId.toString());
        message.setText(text);
        
        try {
            execute(message);
        } catch (TelegramApiException e) {
            throw new RuntimeException("Failed to send Telegram message", e);
        }
    }
} 