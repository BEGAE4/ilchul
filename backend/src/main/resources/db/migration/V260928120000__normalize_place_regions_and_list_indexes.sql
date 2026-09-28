-- Additive nullable columns allow the previous blue/green application to keep writing.
ALTER TABLE place ADD COLUMN sido VARCHAR(30) NULL, ADD COLUMN sigungu VARCHAR(100) NULL;
ALTER TABLE plan_place ADD COLUMN snapshot_sido VARCHAR(30) NULL, ADD COLUMN snapshot_sigungu VARCHAR(100) NULL;
CREATE TEMPORARY TABLE region_backfill (
    id INT PRIMARY KEY, address_value VARCHAR(300), sido VARCHAR(30), sigungu VARCHAR(100)
);

INSERT INTO region_backfill(id, address_value) SELECT place_id, COALESCE(NULLIF(TRIM(address_name), ''), road_address_name) FROM place;
UPDATE region_backfill SET address_value = REGEXP_REPLACE(TRIM(address_value), '[[:space:]]+', ' ');
UPDATE region_backfill SET sido = CASE SUBSTRING_INDEX(TRIM(address_value), ' ', 1)
            WHEN '서울' THEN '서울'
            WHEN '서울특별시' THEN '서울'
            WHEN '부산' THEN '부산'
            WHEN '부산광역시' THEN '부산'
            WHEN '대구' THEN '대구'
            WHEN '대구광역시' THEN '대구'
            WHEN '인천' THEN '인천'
            WHEN '인천광역시' THEN '인천'
            WHEN '대전' THEN '대전'
            WHEN '대전광역시' THEN '대전'
            WHEN '울산' THEN '울산'
            WHEN '울산광역시' THEN '울산'
            WHEN '세종' THEN '세종'
            WHEN '세종특별자치시' THEN '세종'
            WHEN '경기' THEN '경기'
            WHEN '경기도' THEN '경기'
            WHEN '강원' THEN '강원'
            WHEN '강원도' THEN '강원'
            WHEN '강원특별자치도' THEN '강원'
            WHEN '충북' THEN '충북'
            WHEN '충청북도' THEN '충북'
            WHEN '충남' THEN '충남'
            WHEN '충청남도' THEN '충남'
            WHEN '전북' THEN '전북'
            WHEN '전라북도' THEN '전북'
            WHEN '전북특별자치도' THEN '전북'
            WHEN '전남' THEN '전남'
            WHEN '전라남도' THEN '전남'
            WHEN '광주' THEN '전남'
            WHEN '광주광역시' THEN '전남'
            WHEN '전남광주' THEN '전남'
            WHEN '전남광주통합특별시' THEN '전남'
            WHEN '경북' THEN '경북'
            WHEN '경상북도' THEN '경북'
            WHEN '경남' THEN '경남'
            WHEN '경상남도' THEN '경남'
            WHEN '제주' THEN '제주'
            WHEN '제주도' THEN '제주'
            WHEN '제주특별자치도' THEN '제주'
            ELSE NULL END;
UPDATE region_backfill
SET sigungu = CASE
    WHEN sido IS NULL OR TRIM(address_value) NOT LIKE '% %' THEN NULL
    WHEN SUBSTRING_INDEX(SUBSTRING_INDEX(TRIM(address_value), ' ', 2), ' ', -1) REGEXP '[시군구]$'
    THEN CASE
        WHEN SUBSTRING_INDEX(SUBSTRING_INDEX(TRIM(address_value), ' ', 2), ' ', -1) LIKE '%시'
         AND SUBSTRING_INDEX(SUBSTRING_INDEX(TRIM(address_value), ' ', 3), ' ', -1) LIKE '%구'
        THEN SUBSTRING(TRIM(address_value), LOCATE(' ', TRIM(address_value)) + 1,
                       CHAR_LENGTH(SUBSTRING_INDEX(TRIM(address_value), ' ', 3)) - LOCATE(' ', TRIM(address_value)))
        ELSE SUBSTRING_INDEX(SUBSTRING_INDEX(TRIM(address_value), ' ', 2), ' ', -1)
    END
    ELSE NULL END;
UPDATE place target JOIN region_backfill r ON target.place_id = r.id
SET target.sido = r.sido, target.sigungu = r.sigungu;
DELETE FROM region_backfill;

INSERT INTO region_backfill(id, address_value) SELECT pp.plan_place_id, COALESCE(NULLIF(TRIM(pp.snapshot_address_name), ''), NULLIF(TRIM(pp.snapshot_road_address_name), ''), NULLIF(TRIM(pl.address_name), ''), pl.road_address_name) FROM plan_place pp JOIN place pl ON pl.place_id = pp.place_id;
UPDATE region_backfill SET address_value = REGEXP_REPLACE(TRIM(address_value), '[[:space:]]+', ' ');
UPDATE region_backfill SET sido = CASE SUBSTRING_INDEX(TRIM(address_value), ' ', 1)
            WHEN '서울' THEN '서울'
            WHEN '서울특별시' THEN '서울'
            WHEN '부산' THEN '부산'
            WHEN '부산광역시' THEN '부산'
            WHEN '대구' THEN '대구'
            WHEN '대구광역시' THEN '대구'
            WHEN '인천' THEN '인천'
            WHEN '인천광역시' THEN '인천'
            WHEN '대전' THEN '대전'
            WHEN '대전광역시' THEN '대전'
            WHEN '울산' THEN '울산'
            WHEN '울산광역시' THEN '울산'
            WHEN '세종' THEN '세종'
            WHEN '세종특별자치시' THEN '세종'
            WHEN '경기' THEN '경기'
            WHEN '경기도' THEN '경기'
            WHEN '강원' THEN '강원'
            WHEN '강원도' THEN '강원'
            WHEN '강원특별자치도' THEN '강원'
            WHEN '충북' THEN '충북'
            WHEN '충청북도' THEN '충북'
            WHEN '충남' THEN '충남'
            WHEN '충청남도' THEN '충남'
            WHEN '전북' THEN '전북'
            WHEN '전라북도' THEN '전북'
            WHEN '전북특별자치도' THEN '전북'
            WHEN '전남' THEN '전남'
            WHEN '전라남도' THEN '전남'
            WHEN '광주' THEN '전남'
            WHEN '광주광역시' THEN '전남'
            WHEN '전남광주' THEN '전남'
            WHEN '전남광주통합특별시' THEN '전남'
            WHEN '경북' THEN '경북'
            WHEN '경상북도' THEN '경북'
            WHEN '경남' THEN '경남'
            WHEN '경상남도' THEN '경남'
            WHEN '제주' THEN '제주'
            WHEN '제주도' THEN '제주'
            WHEN '제주특별자치도' THEN '제주'
            ELSE NULL END;
UPDATE region_backfill
SET sigungu = CASE
    WHEN sido IS NULL OR TRIM(address_value) NOT LIKE '% %' THEN NULL
    WHEN SUBSTRING_INDEX(SUBSTRING_INDEX(TRIM(address_value), ' ', 2), ' ', -1) REGEXP '[시군구]$'
    THEN CASE
        WHEN SUBSTRING_INDEX(SUBSTRING_INDEX(TRIM(address_value), ' ', 2), ' ', -1) LIKE '%시'
         AND SUBSTRING_INDEX(SUBSTRING_INDEX(TRIM(address_value), ' ', 3), ' ', -1) LIKE '%구'
        THEN SUBSTRING(TRIM(address_value), LOCATE(' ', TRIM(address_value)) + 1,
                       CHAR_LENGTH(SUBSTRING_INDEX(TRIM(address_value), ' ', 3)) - LOCATE(' ', TRIM(address_value)))
        ELSE SUBSTRING_INDEX(SUBSTRING_INDEX(TRIM(address_value), ' ', 2), ' ', -1)
    END
    ELSE NULL END;
UPDATE plan_place target JOIN region_backfill r ON target.plan_place_id = r.id
SET target.snapshot_sido = r.sido, target.snapshot_sigungu = r.sigungu;
DELETE FROM region_backfill;
DROP TEMPORARY TABLE region_backfill;
CREATE INDEX idx_place_region ON place(sido, sigungu);
CREATE INDEX idx_plan_place_region ON plan_place(snapshot_sido, snapshot_sigungu, plan_id);
CREATE INDEX idx_plan_user_created ON plan(user_id, create_at, plan_id);
CREATE INDEX idx_scrapped_plan_user_time ON scrapped_plan(user_id, scrapped_status, scrapped_at, scrap_id);
