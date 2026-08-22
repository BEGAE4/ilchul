'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Check, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ── 공통 바텀시트 껍데기 ──
const SheetShell: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, children }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-y-0 app-frame z-[60] bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[75vh] flex flex-col pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <span className="font-bold text-gray-900">{title}</span>
          <button onClick={onClose} className="p-1.5 -mr-1.5 text-gray-400 active:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-2 pb-3">{children}</div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── 커스텀 드롭다운(단일 선택 바텀시트) ──
export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  value: string;
  options: SelectOption[];
  placeholder: string;
  title: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  value,
  options,
  placeholder,
  title,
  onChange,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50 text-base transition-colors ${className} ${
          selected ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={18} className="text-gray-400 shrink-0" />
      </button>

      {open && (
        <SheetShell title={title} onClose={() => setOpen(false)}>
          <div className="flex flex-col gap-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
                  opt.value === value ? 'bg-primary-50 text-primary-700' : 'text-gray-700 active:bg-gray-50'
                }`}
              >
                {opt.label}
                {opt.value === value && <Check size={16} className="text-primary-500" />}
              </button>
            ))}
          </div>
        </SheetShell>
      )}
    </>
  );
};

// ── 커스텀 시간 선택(시계 바텀시트) ──
// 30분 단위 48개 옵션을 세로로 훑는 대신, 12시간 시계판에서 시(時)를 한 번에 고른다.
interface TimeFieldProps {
  value: string; // HH:MM (30분 단위)
  placeholder?: string;
  title: string;
  onChange: (value: string) => void;
  className?: string;
}

const CLOCK_SIZE = 248; // 시계판 지름(px)
const CLOCK_RADIUS = 96; // 중심 → 숫자 중심 거리(px)
const HOUR_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

interface ClockDraft {
  hour12: number | null; // 아직 고르지 않았으면 null
  minute: number;
  isPm: boolean;
}

function toClockDraft(value: string): ClockDraft {
  if (!value) return { hour12: null, minute: 0, isPm: false };
  const [h, m] = value.split(':').map(Number);
  return { hour12: h % 12 === 0 ? 12 : h % 12, minute: m === 30 ? 30 : 0, isPm: h >= 12 };
}

function fromClockDraft(hour12: number, minute: number, isPm: boolean): string {
  const h24 = isPm ? (hour12 === 12 ? 12 : hour12 + 12) : hour12 === 12 ? 0 : hour12;
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatClockLabel(hour12: number, minute: number, isPm: boolean): string {
  return `${isPm ? '오후' : '오전'} ${hour12}시${minute === 30 ? ' 30분' : ''}`;
}

// 12시를 맨 위에 두고 시계 방향으로 배치 — 숫자 중심 좌표를 삼각함수로 구한다
function hourPosition(hour12: number): { left: number; top: number } {
  const rad = ((hour12 % 12) * 30 * Math.PI) / 180;
  return {
    left: CLOCK_SIZE / 2 + CLOCK_RADIUS * Math.sin(rad),
    top: CLOCK_SIZE / 2 - CLOCK_RADIUS * Math.cos(rad),
  };
}

export const TimeField: React.FC<TimeFieldProps> = ({
  value,
  placeholder = '시간 선택',
  title,
  onChange,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ClockDraft>(() => toClockDraft(value));

  const openSheet = () => {
    setDraft(toClockDraft(value));
    setOpen(true);
  };

  const confirm = () => {
    if (draft.hour12 === null) return;
    onChange(fromClockDraft(draft.hour12, draft.minute, draft.isPm));
    setOpen(false);
  };

  const selected = toClockDraft(value);

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className={`w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50 text-base transition-colors ${className} ${
          value ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        <span>
          {value && selected.hour12 !== null
            ? formatClockLabel(selected.hour12, selected.minute, selected.isPm)
            : placeholder}
        </span>
        <Clock size={18} className="text-gray-400 shrink-0" />
      </button>

      {open && (
        <SheetShell title={title} onClose={() => setOpen(false)}>
          <div className="px-3 pb-2 flex flex-col items-center">
            {/* 오전 / 오후 */}
            <div className="flex w-full max-w-[248px] p-1 bg-gray-100 rounded-xl mb-4">
              {[
                { label: '오전', isPm: false },
                { label: '오후', isPm: true },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, isPm: opt.isPm }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                    draft.isPm === opt.isPm ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* 시계판 */}
            <div
              className="relative rounded-full bg-gray-50"
              style={{ width: CLOCK_SIZE, height: CLOCK_SIZE }}
            >
              {draft.hour12 !== null && (
                <div
                  className="absolute left-1/2 origin-bottom bg-primary-500 rounded-full pointer-events-none"
                  style={{
                    width: 2,
                    height: CLOCK_RADIUS,
                    top: CLOCK_SIZE / 2 - CLOCK_RADIUS,
                    transform: `translateX(-50%) rotate(${(draft.hour12 % 12) * 30}deg)`,
                  }}
                  aria-hidden
                />
              )}
              <div
                className="absolute left-1/2 top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500 pointer-events-none"
                aria-hidden
              />

              {HOUR_NUMBERS.map((hour) => {
                const { left, top } = hourPosition(hour);
                const isActive = draft.hour12 === hour;
                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, hour12: hour }))}
                    aria-label={`${draft.isPm ? '오후' : '오전'} ${hour}시`}
                    aria-pressed={isActive}
                    className={`absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full text-sm font-bold transition-colors ${
                      isActive ? 'bg-primary-500 text-white' : 'text-gray-700 active:bg-primary-50'
                    }`}
                    style={{ left, top }}
                  >
                    {hour}
                  </button>
                );
              })}
            </div>

            {/* 분 — 기존 옵션과 동일하게 30분 단위 */}
            <div className="flex w-full max-w-[248px] gap-2 mt-4">
              {[0, 30].map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, minute }))}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                    draft.minute === minute
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {minute === 0 ? '정각' : '30분'}
                </button>
              ))}
            </div>

            {/* 확정 전 미리보기 — 높이를 고정해 버튼이 밀리지 않게 한다 */}
            <div className="h-6 mt-3 text-sm font-bold text-gray-900">
              {draft.hour12 !== null && formatClockLabel(draft.hour12, draft.minute, draft.isPm)}
            </div>

            <button
              type="button"
              onClick={confirm}
              disabled={draft.hour12 === null}
              className="w-full max-w-[248px] mt-1 mb-1 py-3 rounded-xl bg-primary-500 text-white font-bold disabled:bg-gray-300 transition-colors"
            >
              선택 완료
            </button>
          </div>
        </SheetShell>
      )}
    </>
  );
};

// ── 커스텀 날짜 선택(캘린더 바텀시트) ──
interface DateFieldProps {
  value: string; // YYYY-MM-DD
  min?: string;
  placeholder?: string;
  title: string;
  onChange: (value: string) => void;
  className?: string;
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatDateLabel(value: string): string {
  const [y, m, d] = value.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export const DateField: React.FC<DateFieldProps> = ({
  value,
  min,
  placeholder = '날짜 선택',
  title,
  onChange,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const base = value ? new Date(`${value}T00:00:00`) : min ? new Date(`${min}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());

  const openSheet = () => {
    const b = value ? new Date(`${value}T00:00:00`) : min ? new Date(`${min}T00:00:00`) : new Date();
    setViewYear(b.getFullYear());
    setViewMonth(b.getMonth());
    setOpen(true);
  };

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const goMonth = (delta: number) => {
    let y = viewYear;
    let m = viewMonth + delta;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewYear(y);
    setViewMonth(m);
  };

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className={`w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50 text-base transition-colors ${className} ${
          value ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        <span>{value ? formatDateLabel(value) : placeholder}</span>
      </button>

      {open && (
        <SheetShell title={title} onClose={() => setOpen(false)}>
          <div className="px-3 pb-2">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                className="p-2 text-gray-500 active:bg-gray-100 rounded-full"
                aria-label="이전 달"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-bold text-gray-900">
                {viewYear}년 {viewMonth + 1}월
              </span>
              <button
                type="button"
                onClick={() => goMonth(1)}
                className="p-2 text-gray-500 active:bg-gray-100 rounded-full"
                aria-label="다음 달"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                <div key={d} className="text-center text-xs text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />;
                const dateStr = toDateStr(viewYear, viewMonth, day);
                const disabled = !!min && dateStr < min;
                const isSelected = dateStr === value;
                return (
                  <div key={dateStr} className="flex items-center justify-center">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        onChange(dateStr);
                        setOpen(false);
                      }}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : disabled
                            ? 'text-gray-200'
                            : 'text-gray-700 active:bg-primary-50'
                      }`}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </SheetShell>
      )}
    </>
  );
};
