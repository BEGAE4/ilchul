#!/usr/bin/env python3
"""Run the new region migration against synthetic data in an isolated local MySQL.
Requires mysqld/mysql on PATH. Opens no TCP port and never connects to an existing DB.
"""
from pathlib import Path
import runpy
import shutil
import subprocess
import tempfile
import time

backend = Path(__file__).resolve().parents[1]
migration = backend / 'src/main/resources/db/migration/V260928120000__normalize_place_regions_and_list_indexes.sql'
for executable in ('mysqld', 'mysql'):
    if not shutil.which(executable):
        raise SystemExit(f'{executable} is required')

with tempfile.TemporaryDirectory(prefix='ilchul-region-', dir='/tmp') as temporary:
    directory = Path(temporary)
    data = directory / 'data'
    socket = directory / 'mysql.sock'
    log = directory / 'mysql.log'
    subprocess.run(['mysqld', '--no-defaults', '--initialize-insecure', f'--datadir={data}',
                    f'--log-error={log}'], check=True, capture_output=True)
    server = subprocess.Popen(['mysqld', '--no-defaults', f'--datadir={data}', f'--socket={socket}',
                               '--skip-networking', '--mysqlx=OFF', f'--pid-file={directory / "mysql.pid"}',
                               f'--log-error={log}'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    def query(sql, user="root"):
        return subprocess.run(['mysql', '--no-defaults', '--protocol=SOCKET', f'--socket={socket}',
                               f'--user={user}', '--batch', '--skip-column-names', '--default-character-set=utf8mb4'],
                              input=sql, text=True, capture_output=True, check=True).stdout.strip()
    try:
        for attempt in range(100):
            try:
                query('SELECT 1;')
                break
            except subprocess.CalledProcessError:
                if server.poll() is not None:
                    raise RuntimeError(log.read_text())
                time.sleep(.1)
        else:
            raise RuntimeError('temporary MySQL did not become ready')
        fixture = """
CREATE DATABASE region_test CHARACTER SET utf8mb4;
USE region_test;
CREATE TABLE place(place_id INT PRIMARY KEY, address_name VARCHAR(300), road_address_name VARCHAR(300));
CREATE TABLE plan(plan_id INT PRIMARY KEY, user_id INT, create_at DATETIME);
CREATE TABLE plan_place(plan_place_id INT PRIMARY KEY, place_id INT, plan_id INT, snapshot_address_name VARCHAR(300), snapshot_road_address_name VARCHAR(300));
CREATE TABLE scrapped_plan(scrap_id INT PRIMARY KEY, user_id INT, scrapped_status CHAR(1), scrapped_at DATETIME);
INSERT INTO place VALUES
(1,'전남광주통합특별시 동구 금남로',NULL),
(2,'광주광역시 북구 용봉동',NULL),
(3,'전라남도 순천시 조례동',NULL),
(4,'  경기   수원시 영통구 매탄동',NULL),
(5,'','강원특별자치도 강릉시 경강로'),
(6,'알수없음 동구',NULL),
(7,'전북특별자치도 전주시 완산구 효자동',NULL);
INSERT INTO plan_place VALUES
(1,1,1,'서울 중구 명동',NULL),
(2,2,1,NULL,NULL),
(3,3,1,'','전남광주통합특별시 남구 봉선동');
"""
        query(fixture)
        query("CREATE USER 'migration_test'@'localhost'; GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,DROP,INDEX ON region_test.* TO 'migration_test'@'localhost';")
        try:
            query('USE region_test; ' + migration.read_text(), user='migration_test')
            raise AssertionError('migration unexpectedly worked without CREATE TEMPORARY TABLES')
        except subprocess.CalledProcessError as error:
            assert 'ERROR 1044' in error.stderr, error.stderr
        query("USE region_test; ALTER TABLE place DROP COLUMN sido, DROP COLUMN sigungu; ALTER TABLE plan_place DROP COLUMN snapshot_sido, DROP COLUMN snapshot_sigungu;")
        query("GRANT CREATE TEMPORARY TABLES ON region_test.* TO 'migration_test'@'localhost';")
        query('USE region_test; ' + migration.read_text(), user='migration_test')
        places = query('USE region_test; SELECT place_id,sido,sigungu FROM place ORDER BY place_id;')
        expected = '1\t전남\t동구\n2\t전남\t북구\n3\t전남\t순천시\n4\t경기\t수원시 영통구\n5\t강원\t강릉시\n6\tNULL\tNULL\n7\t전북\t전주시 완산구'
        assert places == expected, (places, expected)
        snapshots = query('USE region_test; SELECT plan_place_id,snapshot_sido,snapshot_sigungu FROM plan_place ORDER BY plan_place_id;')
        assert snapshots == '1\t서울\t중구\n2\t전남\t북구\n3\t전남\t남구', snapshots
        # Old color INSERTs remain valid because every new column is nullable.
        query("USE region_test; INSERT INTO place(place_id,address_name) VALUES(8,'서울 중구');")
        query("USE region_test; INSERT INTO plan_place(plan_place_id,place_id,plan_id,snapshot_address_name) VALUES(4,8,1,'전남 목포시 상동');")
        repair = runpy.run_path(str(backend / 'scripts/render-region-backfill.py'))['render_backfill']()
        query('USE region_test; ' + repair, user='migration_test')
        query('USE region_test; ' + repair, user='migration_test')  # 반복 실행은 기존 정규화 값을 바꾸지 않는다.
        assert query('USE region_test; SELECT sido,sigungu FROM place WHERE place_id=8;') == '서울\t중구'
        assert query('USE region_test; SELECT snapshot_sido,snapshot_sigungu FROM plan_place WHERE plan_place_id=4;') == '전남\t목포시'
        assert query('USE region_test; SELECT sido,sigungu FROM place WHERE place_id=1;') == '전남\t동구'
        print('PASS: MySQL ' + query('SELECT VERSION();') + ' migration, aliases, districts, snapshot precedence, nullable compatibility, repeatable late-write repair, restricted migration grants')
    finally:
        server.terminate()
        try:
            server.wait(timeout=15)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait()
