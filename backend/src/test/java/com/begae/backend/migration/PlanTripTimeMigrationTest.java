package com.begae.backend.migration;

import org.junit.jupiter.api.Test;
import java.sql.DriverManager;
import java.nio.charset.StandardCharsets;
import static org.assertj.core.api.Assertions.*;

class PlanTripTimeMigrationTest {
    @Test void oldRowsAndOldWritersRemainCompatibleWithNullablePolicyMetadata() throws Exception {
        try (var connection = DriverManager.getConnection("jdbc:h2:mem:trip-policy;MODE=MySQL")) {
            var statement = connection.createStatement();
            statement.execute("CREATE TABLE plan(plan_id INT PRIMARY KEY, required_time INT)");
            statement.execute("INSERT INTO plan VALUES(1, 120)");
            try (var stream = getClass().getResourceAsStream("/db/migration/V261002120000__add_plan_trip_time_policy.sql")) {
                assertThat(stream).isNotNull();
                statement.execute(new String(stream.readAllBytes(), StandardCharsets.UTF_8));
            }
            // The previous application still inserts only its known columns.
            statement.execute("INSERT INTO plan(plan_id, required_time) VALUES(2, 60)");
            try (var rows = statement.executeQuery("SELECT required_time, transport, return_time FROM plan ORDER BY plan_id")) {
                assertThat(rows.next()).isTrue(); assertThat(rows.getInt(1)).isEqualTo(120);
                assertThat(rows.getString(2)).isNull(); assertThat(rows.getObject(3)).isNull();
                assertThat(rows.next()).isTrue(); assertThat(rows.getInt(1)).isEqualTo(60);
            }
        }
    }
}
