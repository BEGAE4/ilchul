ALTER TABLE `user`
    ADD COLUMN `user_img_key` VARCHAR(1000) NULL AFTER `user_img`;

ALTER TABLE `user`
    ADD COLUMN `social_image_sync_disabled` BOOLEAN NOT NULL DEFAULT FALSE AFTER `user_img_key`;
