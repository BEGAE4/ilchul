package com.begae.backend.migration;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class MigrationContractTest {

    private static final Path MIGRATION_DIR = Path.of("src/main/resources/db/migration");

    @Test
    void 문의_이미지_객체_key와_파일_메타데이터를_추가하는_forward_migration이_있다() throws Exception {
        String sql = Files.readString(MIGRATION_DIR.resolve(
                "V260920120000__add_cs_inquiry_image_storage_metadata.sql"
        ));

        assertThat(sql)
                .contains("image_key")
                .contains("original_filename")
                .contains("content_type")
                .contains("file_size")
                .contains("MODIFY COLUMN `image_url`");
    }

    @Test
    void plan_36의_도보으로_오타만_조건부로_보정한다() throws Exception {
        String sql = Files.readString(MIGRATION_DIR.resolve(
                "V260920120100__fix_plan_36_description_ro_particle.sql"
        ));

        assertThat(sql)
                .contains("`plan_id` = 36")
                .contains("REPLACE(`plan_description`, '도보으로', '도보로')")
                .contains("`plan_description` LIKE '%도보으로%'");
    }
}
