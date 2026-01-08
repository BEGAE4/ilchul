package com.begae.backend.place.component;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Getter
@NoArgsConstructor
@Component
public class PromptRegistry {

    private String systemPrompt;
    private String userTemplate;

    @PostConstruct
    void load() throws IOException {
        systemPrompt = loadFrom("prompts/SystemPrompt.txt");
        userTemplate = loadFrom("prompts/UserTemplate.txt");
    }

    private String loadFrom(String path) throws IOException {
        ClassPathResource r = new ClassPathResource(path);
        return new String(r.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }
}
