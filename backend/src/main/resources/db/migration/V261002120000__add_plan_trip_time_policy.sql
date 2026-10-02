-- Nullable metadata keeps existing plans and the previous blue/green application compatible.
ALTER TABLE plan ADD COLUMN transport VARCHAR(10) NULL;
ALTER TABLE plan ADD COLUMN travel_limit_minutes INT NULL;
ALTER TABLE plan ADD COLUMN return_time INT NULL;
ALTER TABLE plan ADD COLUMN travel_time_estimated BOOLEAN NULL;
