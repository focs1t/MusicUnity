package ru.musicunity.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.User;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;
import ru.musicunity.backend.pojo.enums.UserRole;
import ru.musicunity.backend.mapper.UserMapper;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
//@Service
@RequiredArgsConstructor
public class TelegramBotService extends TelegramLongPollingBot {
    private final UserService userService;
    private final UserMapper userMapper;

    //@Value("${telegram.bot.username}")
    private String botUsername;

    //@Value("${telegram.bot.token}")
    private String botToken;

    private final Map<String, Long> pendingLinks = new ConcurrentHashMap<>();

    //@PostConstruct
    public void init() {
        //try {
        //    TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
        //    botsApi.registerBot(this);
        //    log.info("Telegram bot {} successfully registered with Long Polling", botUsername);
        //} catch (TelegramApiException e) {
        //    log.error("Failed to register Telegram bot: {}", e.getMessage());
        //    throw new RuntimeException("Failed to register Telegram bot", e);
        //}
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
        // Временно отключаем обработку обновлений
    }

    private void handleStartCommand(Long chatId, String token) {
        // Временно отключаем обработку команды
    }

    private void handleUnlinkCommand(Long chatId) {
        // Временно отключаем обработку команды
    }

    public void notifyModeratorsAboutNewReport(String reportId, String reportType, String reportContent) {
        // Временно отключаем уведомления
    }

    public String generateLinkToken(String username) {
        // Временно отключаем генерацию токена
        return null;
    }

    private void sendMessage(Long chatId, String text) {
        // Временно отключаем отправку сообщений
    }
} 