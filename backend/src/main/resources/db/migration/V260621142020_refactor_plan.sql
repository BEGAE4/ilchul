-- V260621142020_refactor_plan.sql

-- plan 테이블 수정
ALTER TABLE `plan`
    CHANGE COLUMN departure_point departure_point_name VARCHAR(255),
    ADD COLUMN departure_point_address VARCHAR(1000) AFTER `departure_point_name`,
    ADD COLUMN departure_point_x DOUBLE AFTER `departure_point_address`,
    ADD COLUMN departure_point_y DOUBLE AFTER `departure_point_x`;