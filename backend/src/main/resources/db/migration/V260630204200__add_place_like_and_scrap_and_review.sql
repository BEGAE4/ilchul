-- V260630204200__add_place_like_and_scrap_and_review.sql

-- 1. place 테이블에 좋아요 및 스크랩 카운트 컬럼 추가
ALTER TABLE `place` ADD COLUMN `like_count` INT DEFAULT 0,
                    ADD COLUMN `scrap_count` INT DEFAULT 0;

-- 2. scrapped_place 테이블 생성
CREATE TABLE `scrapped_place` (
    `scrap_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `place_id` INT NOT NULL,
    `scrapped_at` DATETIME NOT NULL,
    `scrapped_status` VARCHAR(50) NOT NULL,
    `create_at` DATETIME NULL,
    `last_update_at` DATETIME NULL,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`),
    FOREIGN KEY (`place_id`) REFERENCES `place`(`place_id`),
    UNIQUE KEY `uk_user_place` (`user_id`, `place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. place_review 테이블 생성
CREATE TABLE `place_review` (
    `review_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `place_id` INT NOT NULL,
    `content` TEXT NOT NULL,
    `create_at` DATETIME NULL,
    `last_update_at` DATETIME NULL,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`),
    FOREIGN KEY (`place_id`) REFERENCES `place`(`place_id`),
    KEY `idx_place_review` (`place_id`, `review_id` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. place 테이블의 source_id 에 유니크 제약조건 및 인덱스 추가
ALTER TABLE `place` ADD UNIQUE KEY `uk_place_source` (`source_id`);
