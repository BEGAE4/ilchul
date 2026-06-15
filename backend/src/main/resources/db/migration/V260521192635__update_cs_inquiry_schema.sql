-- Add new columns and remove unused column for cs_inquiry
ALTER TABLE `cs_inquiry` 
    ADD COLUMN `title` VARCHAR(255) AFTER `user_id`,
    ADD COLUMN `img_url` VARCHAR(2000) AFTER `content`,
    ADD COLUMN `answer` TEXT AFTER `inquiry_status`,
    ADD COLUMN `is_deleted` BOOLEAN DEFAULT FALSE AFTER `answer`,
    ADD COLUMN `answered_at` DATETIME AFTER `is_deleted`,
    DROP COLUMN `inquiry_at`;

-- Create table for storing multiple images associated with cs_inquiry
CREATE TABLE `cs_inquiry_image` (
    `image_id` INT AUTO_INCREMENT PRIMARY KEY,
    `inquiry_id` INT NOT NULL,
    `image_url` VARCHAR(2000) NOT NULL,
    FOREIGN KEY (`inquiry_id`) REFERENCES `cs_inquiry`(`inquiry_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
