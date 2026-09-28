#!/usr/bin/env python3
"""Print the bounded region backfill SQL; this script never opens a DB connection.
Run its output only with explicit authorization after old-color writers stop.
"""
from pathlib import Path


def render_backfill():
    backend = Path(__file__).resolve().parents[1]
    migration = backend / 'src/main/resources/db/migration/V260928120000__normalize_place_regions_and_list_indexes.sql'
    sql = migration.read_text()
    sql = sql[sql.index('CREATE TEMPORARY TABLE'):sql.index('CREATE INDEX')]
    sql = sql.replace('FROM place;', 'FROM place WHERE sido IS NULL;')
    sql = sql.replace('FROM plan_place pp JOIN place pl ON pl.place_id = pp.place_id;',
                      'FROM plan_place pp JOIN place pl ON pl.place_id = pp.place_id WHERE pp.snapshot_sido IS NULL;')
    sql = sql.replace('SET target.sido = r.sido, target.sigungu = r.sigungu;',
                      'SET target.sido = r.sido, target.sigungu = r.sigungu WHERE target.sido IS NULL;')
    sql = sql.replace('SET target.snapshot_sido = r.sido, target.snapshot_sigungu = r.sigungu;',
                      'SET target.snapshot_sido = r.sido, target.snapshot_sigungu = r.sigungu WHERE target.snapshot_sido IS NULL;')
    return 'START TRANSACTION;\n' + sql + 'COMMIT;\n'


if __name__ == '__main__':
    print(render_backfill(), end='')
