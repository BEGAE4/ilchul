CREATE TABLE `sanction` (
    `sanction_id`       INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`           INT NOT NULL,
    `type`              VARCHAR(50) NOT NULL,
    `report_id`         INT NULL,
    `admin_id`          INT NOT NULL,
    `reason_label`      VARCHAR(100) NULL,
    `note`              TEXT NULL,
    `applied_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `suspension_end_at` DATETIME NULL,
    `is_released`       BOOLEAN NOT NULL DEFAULT FALSE,
    `released_at`       DATETIME NULL,

    FOREIGN KEY (`user_id`)   REFERENCES `user`(`user_id`),
    FOREIGN KEY (`report_id`) REFERENCES `report`(`report_id`),
    FOREIGN KEY (`admin_id`)  REFERENCES `user`(`user_id`),

    INDEX `idx_sanction_report` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admin_log` (
    `admin_log_id` INT AUTO_INCREMENT PRIMARY KEY,
    `admin_id`     INT NOT NULL,
    `action`       VARCHAR(50) NOT NULL,
    `report_id`    INT NULL,
    `target_type`  VARCHAR(50) NOT NULL,
    `target_id`    INT NOT NULL,
    `note`         TEXT NULL,
    `processed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`admin_id`)  REFERENCES `user`(`user_id`),
    FOREIGN KEY (`report_id`) REFERENCES `report`(`report_id`),

    INDEX `idx_log_report` (`report_id`, `processed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;