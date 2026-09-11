-- place 출처 구분과 웰니스 식별자 추가
-- 웰니스 콘텐츠(이름/주소/이미지/테마)는 정책상 저장하지 않는다. contentId만 보관한다.

ALTER TABLE `place` ADD COLUMN `source` VARCHAR(20) NOT NULL DEFAULT 'KAKAO';

ALTER TABLE `place` DROP INDEX `uk_place_source`;
ALTER TABLE `place` ADD UNIQUE KEY `uk_place_source` (`source`, `source_id`);

ALTER TABLE `place` ADD COLUMN `wellness_content_id` VARCHAR(20) NULL;
ALTER TABLE `place` ADD INDEX `idx_place_wellness` (`wellness_content_id`);
