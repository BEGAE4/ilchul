// 신고 후 "숨기기" 로컬 스토리지 헬퍼
// 디바이스 간 동기 없음. 영구 차단은 자동 블라인드(Q3) 또는 별도 user-block feature가 담당.
// Q7 결정: localStorage only, 디바이스 간 동기화 미지원.

import type { ReportTarget } from '../types';

const STORAGE_KEY = 'report:hidden';

// 컴포지트 키: ${type}:${id} (Critic M-8 — 키 충돌 방지)
function compositeKey(target: ReportTarget): string {
  return `${target.type}:${target.id}`;
}

function readSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set<string>(parsed);
    return new Set();
  } catch {
    // JSON 파싱 실패 시 빈 Set 반환 — throw 금지
    return new Set();
  }
}

function writeSet(set: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // localStorage 미지원/쿼터 초과 — silently ignore
  }
}

export function add(target: ReportTarget): void {
  const set = readSet();
  set.add(compositeKey(target));
  writeSet(set);
}

export function remove(target: ReportTarget): void {
  const set = readSet();
  set.delete(compositeKey(target));
  writeSet(set);
}

export function has(target: ReportTarget): boolean {
  return readSet().has(compositeKey(target));
}

// add의 alias — 계획서 §6 명시
export function markReported(target: ReportTarget): void {
  add(target);
}

export function getAll(): ReadonlySet<string> {
  return readSet();
}

export function clear(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently ignore
  }
}
