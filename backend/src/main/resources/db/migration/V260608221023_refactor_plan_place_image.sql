-- V260608221023_refactor_plan_place_image.sql

-- plan_place_image 테이블 확장
ALTER TABLE `plan_place_image`
    ADD COLUMN image_key VARCHAR(1000) AFTER `plan_place_id`,
    ADD COLUMN original_filename VARCHAR(1000) AFTER `image_url`,
    ADD COLUMN content_type VARCHAR(255) AFTER `original_filename`,
    ADD COLUMN file_size BIGINT AFTER `content_type`;

