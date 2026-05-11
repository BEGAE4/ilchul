-- V260511002931__refactor_reply_and_add_like_reply.sql

-- 1. 기존 reply 테이블 확장
ALTER TABLE `reply`
    ADD COLUMN `parent_reply_id` INT NULL AFTER `plan_id`,
    ADD COLUMN `mentions` JSON NULL AFTER `parent_reply_id`,
    ADD COLUMN `child_count` INT DEFAULT 0 AFTER `like_count`,
    ADD COLUMN `is_deleted` BOOLEAN DEFAULT FALSE AFTER `child_count`,
    ADD COLUMN `create_at` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `is_deleted`,
    ADD INDEX idx_reply_parent (parent_reply_id);
    ADD INDEX idx_reply_plan_parent (plan_id, parent_reply_id);

-- 2. like_reply 테이블 생성 (유니크 제약 조건 포함)
CREATE TABLE `like_reply` (
    `like_reply_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `reply_id` INT NOT NULL,
    `create_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_reply` (`user_id`, `reply_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`),
    FOREIGN KEY (`reply_id`) REFERENCES `reply`(`reply_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
