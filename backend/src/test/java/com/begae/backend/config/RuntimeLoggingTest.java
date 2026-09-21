package com.begae.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.logging.LogLevel;
import org.springframework.boot.logging.LoggingSystem;
import org.springframework.context.annotation.Configuration;
import static org.assertj.core.api.Assertions.assertThat;

class RuntimeLoggingTest {
    @Configuration(proxyBeanMethods = false)
    static class MinimalApplication { }

    @Test void cacheTraceIsDisabledDuringRealBootLoggingInitialization() {
        try (var context = new SpringApplicationBuilder(MinimalApplication.class).profiles("test")
                .properties("spring.main.web-application-type=none", "spring.main.banner-mode=off").run()) {
            assertThat(LoggingSystem.get(getClass().getClassLoader())
                    .getLoggerConfiguration("org.springframework.cache").getEffectiveLevel()).isEqualTo(LogLevel.INFO);
        }
    }
}
