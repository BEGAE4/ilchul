package com.begae.backend.plan;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class PlanImageMigrationTest {

    @Test
    void planImageMigrationAddsLastUpdateAtColumn() throws Exception {
        ClassPathResource migration = new ClassPathResource(
                "db/migration/V260821120000__add_plan_image_last_update_at.sql"
        );
        String sql = new String(migration.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        assertThat(sql)
                .contains("ALTER TABLE `plan_image`")
                .contains("ADD COLUMN `last_update_at` DATETIME NULL");
    }
}
