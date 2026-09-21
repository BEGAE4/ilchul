package com.begae.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import static org.assertj.core.api.Assertions.assertThat;

class RedisConfigCredentialsTest {
    @Test void connectionFactoryActuallyUsesConfiguredAclIdentity() {
        new ApplicationContextRunner().withUserConfiguration(RedisConfig.class)
                .withConfiguration(AutoConfigurations.of(RedisAutoConfiguration.class))
                .withPropertyValues("spring.data.redis.host=127.0.0.1", "spring.data.redis.port=16379",
                        "spring.data.redis.username=test-ilchul", "spring.data.redis.password=test-only-secret")
                .run(context -> {
                    var settings = context.getBean(LettuceConnectionFactory.class).getStandaloneConfiguration();
                    assertThat(settings.getUsername()).isEqualTo("test-ilchul");
                    assertThat(settings.getPassword().get()).isEqualTo("test-only-secret".toCharArray());
                });
    }
}
