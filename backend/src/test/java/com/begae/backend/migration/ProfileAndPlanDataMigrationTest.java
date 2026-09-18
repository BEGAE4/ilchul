package com.begae.backend.migration;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.assertj.core.api.Assertions.assertThat;

class ProfileAndPlanDataMigrationTest {

    @Test
    void 프로필_이미지_상태_컬럼은_기존_사용자에게_소셜_동기화를_허용한다() throws Exception {
        try (Connection connection = connection("profile-image-migration");
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE `user` (`user_id` INT PRIMARY KEY, `user_img` VARCHAR(2000))");
            statement.execute("INSERT INTO `user` (`user_id`, `user_img`) VALUES (1, NULL)");
            statement.execute(sql("db/migration/V260918120000__add_user_profile_image_state.sql"));

            ResultSet row = statement.executeQuery(
                    "SELECT `user_img_key`, `social_image_sync_disabled` FROM `user` WHERE `user_id` = 1"
            );
            row.next();
            assertThat(row.getString("user_img_key")).isNull();
            assertThat(row.getBoolean("social_image_sync_disabled")).isFalse();
        }
    }

    @Test
    void 지정된_플랜의_잘못된_조사만_조건부로_수정한다() throws Exception {
        try (Connection connection = connection("plan-description-migration");
             Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE `plan` (`plan_id` INT PRIMARY KEY, `plan_description` TEXT)");
            statement.execute("INSERT INTO `plan` VALUES (12, '도보으로 이동'), (999, '도보으로 이동')");
            statement.execute(sql("db/migration/V260918120100__fix_plan_description_ro_particle.sql"));

            ResultSet rows = statement.executeQuery("SELECT `plan_id`, `plan_description` FROM `plan` ORDER BY `plan_id`");
            rows.next();
            assertThat(rows.getString("plan_description")).isEqualTo("도보로 이동");
            rows.next();
            assertThat(rows.getString("plan_description")).isEqualTo("도보으로 이동");
        }
    }

    private Connection connection(String name) throws Exception {
        return DriverManager.getConnection("jdbc:h2:mem:" + name + ";MODE=MySQL;DB_CLOSE_DELAY=-1", "sa", "");
    }

    private String sql(String path) throws Exception {
        ClassPathResource resource = new ClassPathResource(path);
        return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }
}
