package com.begae.backend.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import static org.assertj.core.api.Assertions.assertThat;

class HostMigrationLoggingTest {
    @TempDir Path directory;

    @Test void firstFlywayInitializationMigratesWithoutLoggingCredentials() throws Exception {
        probe("success", "MIGRATION_PROBE_OK");
    }

    @Test void migrationFailureDoesNotLogSqlOrCredentials() throws Exception {
        probe("failure", "MIGRATION_PROBE_FAILURE_SANITIZED");
    }

    private void probe(String mode, String expected) throws Exception {
        Path out = directory.resolve(mode + ".out"), err = directory.resolve(mode + ".err");
        var process = new ProcessBuilder(Path.of(System.getProperty("java.home"), "bin", "java").toString(),
                "-cp", System.getProperty("ilchul.test.classpath"),
                HostMigrationProbe.class.getName(), mode)
                .redirectOutput(out.toFile()).redirectError(err.toFile()).start();
        try {
            assertThat(process.waitFor(30, TimeUnit.SECONDS)).isTrue();
            assertThat(process.exitValue()).withFailMessage("Isolated fixture failed: %s", Files.readString(err)).isZero();
            assertThat(Files.readString(out).strip()).isEqualTo(expected);
            assertThat(Files.readString(err)).isEmpty();
        } finally {
            if (process.isAlive()) { process.destroyForcibly(); process.waitFor(); }
        }
    }
}
