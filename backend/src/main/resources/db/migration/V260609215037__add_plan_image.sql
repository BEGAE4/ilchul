CREATE TABLE `plan_image` (
    `plan_image_id` INT AUTO_INCREMENT PRIMARY KEY,
    `image_key` VARCHAR(1000),
    `image_url` VARCHAR(2000),
    `original_filename` VARCHAR(1000),
    `content_type` VARCHAR(255),
    `file_size` BIGINT,
    `plan_id` INT,
    `create_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`plan_id`) REFERENCES `plan`(`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;