package com.begae.backend.config;

import java.nio.file.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.context.support.GenericApplicationContext;
import org.springframework.mock.env.MockEnvironment;
import static org.assertj.core.api.Assertions.*;

class RuntimeSecretsTest {
    @TempDir Path directory;
    private int owner() throws Exception { return (int) Files.getAttribute(directory, "unix:uid"); }
    private Path fixture(String json) throws Exception {
        Files.setAttribute(directory, "unix:mode", 0750);
        Path generation = Files.createDirectory(directory.resolve("g-ABC123"));
        Files.setAttribute(generation, "unix:mode", 0750);
        Path file = Files.writeString(generation.resolve("CONFIG_JSON"), json);
        Files.setAttribute(file, "unix:mode", 0640);
        Files.createSymbolicLink(directory.resolve("current"), Path.of("g-ABC123"));
        return file;
    }
    @Test void readsOnlyDeclaredFieldsFromOneGeneration() throws Exception {
        fixture("{\"MYSQL_PASSWORD\":\"test-only-value\"}");
        assertThat(RuntimeSecrets.read(directory, Set.of("MYSQL_PASSWORD"), owner()))
                .containsExactly(entry("MYSQL_PASSWORD", "test-only-value"));
    }
    @Test void rejectsMissingFileWithoutLeakingCause() throws Exception {
        assertThatThrownBy(() -> RuntimeSecrets.read(directory, Set.of("MYSQL_PASSWORD"), owner()))
                .hasMessage("RUNTIME_SECRET_UNAVAILABLE").hasNoCause();
    }
    @Test void rejectsMalformedSchemaWithoutEchoingValues() throws Exception {
        Path file = fixture("{}");
        for (String json : List.of("{}", "[]", "{\"MYSQL_PASSWORD\":null}",
                "{\"MYSQL_PASSWORD\":\" \"}", "{\"MYSQL_PASSWORD\":42}",
                "{\"MYSQL_PASSWORD\":\"a\",\"MYSQL_ROOT_PASSWORD\":\"b\"}",
                "{\"MYSQL_PASSWORD\":\"a\",\"MYSQL_PASSWORD\":\"b\"}",
                "{\"MYSQL_PASSWORD\":\"a\"} {}", "{\"MYSQL_PASSWORD\":\"a\\u0000b\"}")) {
            Files.writeString(file, json);
            assertThatThrownBy(() -> RuntimeSecrets.read(directory, Set.of("MYSQL_PASSWORD"), owner()))
                    .hasMessage("RUNTIME_SECRET_UNAVAILABLE").hasNoCause();
        }
    }
    @Test void rejectsUnsafePermissionsAndOwnership() throws Exception {
        Path file = fixture("{\"MYSQL_PASSWORD\":\"a\"}");
        for (int mode : List.of(0600, 0644, 0660, 04640)) {
            Files.setAttribute(file, "unix:mode", mode);
            assertThatThrownBy(() -> RuntimeSecrets.read(directory, Set.of("MYSQL_PASSWORD"), owner()))
                    .hasMessage("RUNTIME_SECRET_UNAVAILABLE");
        }
        Files.setAttribute(file, "unix:mode", 0640);
        assertThatThrownBy(() -> RuntimeSecrets.read(directory, Set.of("MYSQL_PASSWORD"), owner() + 1))
                .hasMessage("RUNTIME_SECRET_UNAVAILABLE");
    }
    @Test void rejectsSymlinkFileAndTraversalGeneration() throws Exception {
        Path file = fixture("{\"MYSQL_PASSWORD\":\"a\"}");
        Path moved = Files.move(file, file.resolveSibling("other"));
        Files.createSymbolicLink(file, moved);
        assertThatThrownBy(() -> RuntimeSecrets.read(directory, Set.of("MYSQL_PASSWORD"), owner()))
                .hasMessage("RUNTIME_SECRET_UNAVAILABLE");
        Files.delete(directory.resolve("current"));
        Files.createSymbolicLink(directory.resolve("current"), Path.of("../g-ABC123"));
        assertThatThrownBy(() -> RuntimeSecrets.read(directory, Set.of("MYSQL_PASSWORD"), owner()))
                .hasMessage("RUNTIME_SECRET_UNAVAILABLE");
    }
    @Test void rejectsOversizeAndInvalidUtf8() throws Exception {
        Path file = fixture("{}");
        Files.write(file, new byte[65537]);
        assertThatThrownBy(() -> RuntimeSecrets.read(directory, Set.of("MYSQL_PASSWORD"), owner()))
                .hasMessage("RUNTIME_SECRET_UNAVAILABLE");
        Files.write(file, new byte[]{(byte) 0xc3, 0x28});
        assertThatThrownBy(() -> RuntimeSecrets.read(directory, Set.of("MYSQL_PASSWORD"), owner()))
                .hasMessage("RUNTIME_SECRET_UNAVAILABLE");
    }
    @Test void vaultModeCannotFallBackToEnvironmentOrEnableFlyway() {
        try (var context = new GenericApplicationContext()) {
            context.setEnvironment(new MockEnvironment().withProperty("ILCHUL_RUNTIME_MODE", "vault")
                    .withProperty("MYSQL_PASSWORD", "environment-value")
                    .withProperty("spring.flyway.enabled", "true"));
            assertThatThrownBy(() -> new RuntimeSecrets().initialize(context))
                    .hasMessage("RUNTIME_SECRET_UNAVAILABLE");
        }
    }
    @Test void localModeKeepsExistingConfiguration() {
        try (var context = new GenericApplicationContext()) {
            context.setEnvironment(new MockEnvironment().withProperty("MYSQL_PASSWORD", "local-value"));
            new RuntimeSecrets().initialize(context);
            assertThat(context.getEnvironment().getProperty("MYSQL_PASSWORD")).isEqualTo("local-value");
        }
    }
    @Test void migrationRejectsRuntimeCredentialBundle() throws Exception {
        fixture("{\"MYSQL_USER\":\"runtime\",\"MYSQL_PASSWORD\":\"fake\",\"JWT_SECRET_KEY\":\"fake\"}");
        assertThatThrownBy(() -> RuntimeSecrets.read(directory, RuntimeSecrets.MIGRATION_NAMES, owner()))
                .hasMessage("RUNTIME_SECRET_UNAVAILABLE");
    }
    @Test void vaultPropertiesOverrideDatasourceRedisAndDisableDdl() {
        var values = RuntimeSecrets.runtimeProperties(Map.of("MYSQL_USER", "test-user", "MYSQL_PASSWORD", "test-db",
                "REDIS_USERNAME", "test-redis-user", "REDIS_PASSWORD", "test-redis"));
        var env = new MockEnvironment().withProperty("spring.flyway.enabled", "true")
                .withProperty("spring.jpa.hibernate.ddl-auto", "create");
        env.getPropertySources().addFirst(new org.springframework.core.env.MapPropertySource("vaultRuntime", values));
        assertThat(env.getProperty("spring.flyway.enabled", Boolean.class)).isFalse();
        assertThat(env.getProperty("spring.jpa.hibernate.ddl-auto")).isEqualTo("none");
        assertThat(env.getProperty("spring.datasource.password")).isEqualTo("test-db");
        assertThat(env.getProperty("spring.data.redis.username")).isEqualTo("test-redis-user");
        assertThat(env.getProperty("spring.data.redis.password")).isEqualTo("test-redis");
    }
}
