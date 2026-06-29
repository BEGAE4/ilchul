-- V260622233000__add_auditing_columns.sql

-- 1. user
ALTER TABLE `user` ADD COLUMN `last_update_at` DATETIME NULL;

-- 2. place
ALTER TABLE `place` ADD COLUMN `create_at` DATETIME NULL,
                    ADD COLUMN `last_update_at` DATETIME NULL;

-- 3. plan
ALTER TABLE `plan` ADD COLUMN `last_update_at` DATETIME NULL;

-- 4. likes
ALTER TABLE `likes` ADD COLUMN `create_at` DATETIME NULL,
                     ADD COLUMN `last_update_at` DATETIME NULL;

-- 5. cs_inquiry
ALTER TABLE `cs_inquiry` ADD COLUMN `create_at` DATETIME NULL,
                          ADD COLUMN `last_update_at` DATETIME NULL;

-- 6. scrapped_plan
ALTER TABLE `scrapped_plan` ADD COLUMN `create_at` DATETIME NULL,
                             ADD COLUMN `last_update_at` DATETIME NULL;

-- 7. plan_place
ALTER TABLE `plan_place` ADD COLUMN `create_at` DATETIME NULL,
                          ADD COLUMN `last_update_at` DATETIME NULL;

-- 8. plan_place_image
ALTER TABLE `plan_place_image` ADD COLUMN `create_at` DATETIME NULL,
                                ADD COLUMN `last_update_at` DATETIME NULL;

-- 9. reply
ALTER TABLE `reply` ADD COLUMN `last_update_at` DATETIME NULL;

-- 10. report
ALTER TABLE `report` ADD COLUMN `create_at` DATETIME NULL,
                      ADD COLUMN `last_update_at` DATETIME NULL;

-- 11. like_reply
ALTER TABLE `like_reply` ADD COLUMN `last_update_at` DATETIME NULL;

-- 12. cs_inquiry_image
ALTER TABLE `cs_inquiry_image` ADD COLUMN `create_at` DATETIME NULL,
                                ADD COLUMN `last_update_at` DATETIME NULL;

-- 13. sanction
ALTER TABLE `sanction` ADD COLUMN `create_at` DATETIME NULL,
                        ADD COLUMN `last_update_at` DATETIME NULL;

-- 14. admin_log
ALTER TABLE `admin_log` ADD COLUMN `create_at` DATETIME NULL,
                         ADD COLUMN `last_update_at` DATETIME NULL;
