ALTER TABLE `cs_inquiry_image`
    MODIFY COLUMN `image_url` VARCHAR(2000) NULL,
    ADD COLUMN `image_key` VARCHAR(1000) NULL AFTER `image_url`,
    ADD COLUMN `original_filename` VARCHAR(255) NULL AFTER `image_key`,
    ADD COLUMN `content_type` VARCHAR(100) NULL AFTER `original_filename`,
    ADD COLUMN `file_size` BIGINT NULL AFTER `content_type`;
