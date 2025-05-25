package ru.musicunity.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import ru.musicunity.backend.service.TestDataInitializer;

@Configuration
@RequiredArgsConstructor
public class TestDataInitializerConfig {
    private final TestDataInitializer testDataInitializer;

    @Bean
    @Profile("dev")
    public CommandLineRunner initTestData() {
        return args -> testDataInitializer.initializeTestData();
    }
} 