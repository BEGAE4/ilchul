package com.begae.backend.config;

import java.sql.DriverManager;
import java.util.Map;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

/** Runs in a fresh JVM: Flyway's global logger must not be initialized by another test. */
public final class HostMigrationProbe {
    public static void main(String[] args) throws Exception {
        String fixturePassword = "test-only-credential-must-not-be-logged";
        String url = "jdbc:h2:mem:host_migration_probe;DB_CLOSE_DELAY=-1";
        boolean fail = args[0].equals("failure");
        var flyway = RuntimeSecrets.migrationConfiguration(Map.of(
                        "MYSQL_USER", "fixture-user", "MYSQL_PASSWORD", fixturePassword))
                .dataSource(url, "fixture-user", fixturePassword)
                .locations(new String[0]).javaMigrations(new V1__HostMigrationProbe(fail)).load();
        try {
            var result = flyway.migrate();
            if (fail || result.migrationsExecuted != 1) throw new AssertionError();
            try (var connection = DriverManager.getConnection(url, "fixture-user", fixturePassword);
                 var statement = connection.createStatement();
                 var rows = statement.executeQuery("SELECT COUNT(*) FROM host_migration_probe")) {
                if (!rows.next() || rows.getInt(1) != 1) throw new AssertionError();
            }
            if (!flyway.getConfiguration().isCleanDisabled() || flyway.getConfiguration().isBaselineOnMigrate())
                throw new AssertionError();
            System.out.println("MIGRATION_PROBE_OK");
        } catch (org.flywaydb.core.api.FlywayException expected) {
            if (!fail) throw expected;
            Throwable cause = expected;
            while (cause.getCause() != null) cause = cause.getCause();
            if (!(cause instanceof java.sql.SQLException)
                    || !cause.getMessage().contains("INVALID SQL " + fixturePassword))
                throw new AssertionError("Expected the fixture SQL to fail", expected);
            System.out.println("MIGRATION_PROBE_FAILURE_SANITIZED");
        }
    }
}

class V1__HostMigrationProbe extends BaseJavaMigration {
    private final boolean fail;
    V1__HostMigrationProbe(boolean fail) { this.fail = fail; }
    @Override public void migrate(Context context) throws Exception {
        try (var statement = context.getConnection().createStatement()) {
            if (fail) statement.execute("INVALID SQL test-only-credential-must-not-be-logged");
            statement.execute("CREATE TABLE host_migration_probe(id INT PRIMARY KEY)");
            statement.execute("INSERT INTO host_migration_probe VALUES (1)");
        }
    }
}
