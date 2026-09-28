package com.begae.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import software.amazon.awssdk.auth.credentials.*;

@Configuration
public class VaultStorageCredentials {
    @Bean
    public AwsCredentialsProvider provider(Environment environment) {
        if ("local".equals(environment.getProperty("ILCHUL_RUNTIME_MODE", "local"))) {
            return DefaultCredentialsProvider.builder().build();
        }
        String access = environment.getProperty("AWS_ACCESS_KEY_ID");
        String secret = environment.getProperty("AWS_SECRET_ACCESS_KEY");
        if (!"vault".equals(environment.getProperty("ILCHUL_RUNTIME_MODE"))
                || access == null || access.isBlank() || secret == null || secret.isBlank()) {
            throw new IllegalStateException("STORAGE_CREDENTIAL_UNAVAILABLE");
        }
        return StaticCredentialsProvider.create(AwsBasicCredentials.create(access, secret));
    }
}
