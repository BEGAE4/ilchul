-- V1__init.sql
-- Initial schema generation based on refactored entities

CREATE TABLE `user` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_email` VARCHAR(255),
    `social_type` VARCHAR(50),
    `user_role` VARCHAR(50),
    `user_status` VARCHAR(50),
    `user_nickname` VARCHAR(255),
    `user_intro` VARCHAR(255),
    `user_img` VARCHAR(255),
    `create_at` DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `place` (
    `place_id` INT AUTO_INCREMENT PRIMARY KEY,
    `source_id` VARCHAR(255),
    `address_name` VARCHAR(255),
    `road_address_name` VARCHAR(255),
    `category_name` VARCHAR(255),
    `phone` VARCHAR(50),
    `place_name` VARCHAR(255),
    `place_url` VARCHAR(255),
    `place_image_url` VARCHAR(255),
    `x` DOUBLE,
    `y` DOUBLE,
    `last_fetched_at` DATETIME,
    `last_seen_at` DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `plan` (
    `plan_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `plan_title` VARCHAR(255),
    `is_verified` BOOLEAN,
    `is_plan_visible` BOOLEAN,
    `plan_description` TEXT,
    `required_time` INT,
    `total_distance` INT,
    `departure_point` VARCHAR(255),
    `trip_start_date` DATETIME,
    `trip_end_date` DATETIME,
    `like_count` INT DEFAULT 0,
    `scrap_count` INT DEFAULT 0,
    `create_at` DATETIME,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `likes` (
    `like_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `type_id` INT,
    `like_type` VARCHAR(50),
    `like_status` BOOLEAN,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cs_inquiry` (
    `inquiry_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `content` TEXT,
    `inquiry_type` CHAR(1),
    `inquiry_at` DATETIME,
    `iquiry_status` CHAR(1),
    `closed_at` DATETIME,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `scrapped_plan` (
    `scrap_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `plan_id` INT,
    `scrapped_at` DATETIME,
    `scrapped_status` VARCHAR(50),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`),
    FOREIGN KEY (`plan_id`) REFERENCES `plan`(`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `plan_place` (
    `plan_place_id` INT AUTO_INCREMENT PRIMARY KEY,
    `plan_id` INT,
    `place_id` INT,
    `order_index` INT,
    `travel_time` INT,
    `stay_time` INT,
    `is_stamped` BOOLEAN,
    `snapshot_address_name` VARCHAR(255),
    `snapshot_road_address_name` VARCHAR(255),
    `snapshot_category_name` VARCHAR(255),
    `snapshot_place_name` VARCHAR(255),
    `snapshot_x` DOUBLE,
    `snapshot_y` DOUBLE,
    FOREIGN KEY (`plan_id`) REFERENCES `plan`(`plan_id`),
    FOREIGN KEY (`place_id`) REFERENCES `place`(`place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `plan_place_image` (
    `plan_place_image_id` INT AUTO_INCREMENT PRIMARY KEY,
    `plan_place_id` INT,
    `image_url` VARCHAR(255),
    FOREIGN KEY (`plan_place_id`) REFERENCES `plan_place`(`plan_place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reply` (
    `reply_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `plan_id` INT,
    `content` TEXT,
    `like_count` INT DEFAULT 0,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`),
    FOREIGN KEY (`plan_id`) REFERENCES `plan`(`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `report` (
    `report_id` INT AUTO_INCREMENT PRIMARY KEY,
    `report_user_id` INT,
    `reported_user_id` INT,
    `type_id` INT,
    `report_type` CHAR(1),
    `report_reason` CHAR(1),
    `content` TEXT,
    FOREIGN KEY (`report_user_id`) REFERENCES `user`(`user_id`),
    FOREIGN KEY (`reported_user_id`) REFERENCES `user`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
