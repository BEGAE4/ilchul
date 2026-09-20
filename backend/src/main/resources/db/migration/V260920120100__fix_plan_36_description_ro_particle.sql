UPDATE `plan`
SET `plan_description` = REPLACE(`plan_description`, '도보으로', '도보로')
WHERE `plan_id` = 36
  AND `plan_description` LIKE '%도보으로%';
