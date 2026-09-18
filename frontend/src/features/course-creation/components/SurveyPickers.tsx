'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Check, Minus, Plus, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MIN_TRIP_MINUTES,
  STEP_MINUTES,
  computeEnd,
  describeReturn,
  formatDuration,
  formatTimeLabel,
} from '../utils/schedule';

// ── 공통 바텀시트 껍데기 ──
interface SheetShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const SheetFrame: React.FC<SheetShellProps> = ({ title, onClose, children }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-y-0 app-frame z-[120] bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[calc(100dvh-24px)] flex flex-col pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <span className="font-bold text-gray-900">{title}</span>
          <button onClick={onClose} className="p-1.5 -mr-1.5 text-gray-400 active:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        {/* overscroll-contain: 시트 끝까지 스크롤해도 뒤 화면이 따라 움직이지 않게 한다 */}
        <div className="overflow-y-auto overscroll-contain px-2 pb-3">{children}</div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// 시트는 반드시 body 에 그린다(포털). 시트를 여는 버튼은 설문 화면의 스크롤 영역 안에 있는데,
//  - 설문 컨테이너는 app-frame 의 translate 때문에 안쪽 position:fixed 의 기준이 되고,
//  - iOS Safari 는 스크롤 컨테이너(overflow auto) 안의 fixed 요소를 그 컨테이너 범위로 잘라낸다.
// 그 자리에 그대로 그리면 Chrome 에서는 멀쩡해 보여도 아이폰에서는 시트가 가운데 스크롤 영역에 갇혀
// 위아래가 잘리고 하단 버튼에 덮인다 (2026-09-18 운영 확인).
const SheetShell: React.FC<SheetShellProps> = (props) =>
  typeof document === 'undefined' ? null : createPortal(<SheetFrame {...props} />, document.body);

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

// ── 시각 선택(시계 바텀시트) ──
// 30분 단위 48개 옵션을 세로로 훑는 대신, 12시간 시계판에서 시(時)를 한 번에 고른다.
// 일정 문장의 '출발' 칸이 직접 여닫으므로 필드가 아니라 시트만 내보낸다.
interface TimeSheetProps {
  title: string;
  value: string; // HH:MM (30분 단위)
  /** 이 시각보다 이른 칸은 고를 수 없다 (오늘을 골랐을 때의 '지금') */
  minTime?: string;
  /** 시계 위에 띄우는 빠른 선택 — 오늘이면 '지금 출발' */
  nowOption?: { value: string; label: string };
  onConfirm: (value: string) => void;
  onClose: () => void;
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

// 12시를 맨 위에 두고 시계 방향으로 배치 — 숫자 중심 좌표를 삼각함수로 구한다
function hourPosition(hour12: number): { left: number; top: number } {
  const rad = ((hour12 % 12) * 30 * Math.PI) / 180;
  return {
    left: CLOCK_SIZE / 2 + CLOCK_RADIUS * Math.sin(rad),
    top: CLOCK_SIZE / 2 - CLOCK_RADIUS * Math.cos(rad),
  };
}

export const TimeSheet: React.FC<TimeSheetProps> = ({
  title,
  value,
  minTime,
  nowOption,
  onConfirm,
  onClose,
}) => {
  // 'HH:MM' 은 제로패딩이라 문자열 비교로 시각 비교가 성립한다
  const isAllowed = (time: string) => !minTime || time >= minTime;
  const isAmAllowed = isAllowed('11:30');

  const [draft, setDraft] = useState<ClockDraft>(() => {
    const d = toClockDraft(value);
    // 오전이 통째로 지났는데 값이 비어 오전으로 시작하면 전부 비활성으로 보인다
    return !d.isPm && !isAmAllowed ? { hour12: null, minute: 0, isPm: true } : d;
  });

  const draftValue =
    draft.hour12 === null ? null : fromClockDraft(draft.hour12, draft.minute, draft.isPm);
  const canConfirm = draftValue !== null && isAllowed(draftValue);

  const pickHour = (hour: number) =>
    setDraft((d) => ({
      ...d,
      hour12: hour,
      // 정각은 지났고 30분만 남은 시(예: 지금 7:10 → 7시)는 30분으로 넘겨준다
      minute: isAllowed(fromClockDraft(hour, d.minute, d.isPm)) ? d.minute : 30,
    }));

  const pickPeriod = (isPm: boolean) =>
    setDraft((d) => {
      if (d.hour12 === null) return { ...d, isPm };
      const keepsHour = isAllowed(fromClockDraft(d.hour12, 30, isPm));
      return { ...d, isPm, hour12: keepsHour ? d.hour12 : null };
    });

  return (
    <SheetShell title={title} onClose={onClose}>
      <div className="px-3 pb-2 flex flex-col items-center">
        {nowOption && (
          <button
            type="button"
            onClick={() => onConfirm(nowOption.value)}
            className="w-full max-w-[248px] mb-3 py-2.5 rounded-xl border border-accent-400 bg-accent-50 text-accent-700 text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            <Zap size={15} />
            지금 출발
            <span className="text-xs font-medium text-accent-400">{nowOption.label}</span>
          </button>
        )}

        {/* 오전 / 오후 */}
        <div className="flex w-full max-w-[248px] p-1 bg-gray-100 rounded-xl mb-4">
          {[
            { label: '오전', isPm: false },
            { label: '오후', isPm: true },
          ].map((opt) => {
            const disabled = !opt.isPm && !isAmAllowed;
            return (
              <button
                key={opt.label}
                type="button"
                disabled={disabled}
                onClick={() => pickPeriod(opt.isPm)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                  disabled
                    ? 'text-gray-300'
                    : draft.isPm === opt.isPm
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
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
            // 그 시의 30분 칸까지 지났으면 고를 수 없다
            const disabled = !isAllowed(fromClockDraft(hour, 30, draft.isPm));
            return (
              <button
                key={hour}
                type="button"
                disabled={disabled}
                onClick={() => pickHour(hour)}
                aria-label={`${draft.isPm ? '오후' : '오전'} ${hour}시`}
                aria-pressed={isActive}
                className={`absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : disabled
                      ? 'text-gray-200'
                      : 'text-gray-700 active:bg-primary-50'
                }`}
                style={{ left, top }}
              >
                {hour}
              </button>
            );
          })}
        </div>

        {/* 분 — 30분 단위 */}
        <div className="flex w-full max-w-[248px] gap-2 mt-4">
          {[0, 30].map((minute) => {
            const disabled =
              draft.hour12 !== null && !isAllowed(fromClockDraft(draft.hour12, minute, draft.isPm));
            return (
              <button
                key={minute}
                type="button"
                disabled={disabled}
                onClick={() => setDraft((d) => ({ ...d, minute }))}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
                  disabled
                    ? 'border-gray-100 text-gray-300'
                    : draft.minute === minute
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600'
                }`}
              >
                {minute === 0 ? '정각' : '30분'}
              </button>
            );
          })}
        </div>

        {/* 확정 전 미리보기 — 높이를 고정해 버튼이 밀리지 않게 한다 */}
        <div className="h-6 mt-3 text-sm font-bold text-gray-900">
          {draftValue && formatTimeLabel(draftValue)}
        </div>

        <button
          type="button"
          onClick={() => draftValue && onConfirm(draftValue)}
          disabled={!canConfirm}
          className="w-full max-w-[248px] mt-1 mb-1 py-3 rounded-xl bg-primary-500 text-white font-bold disabled:bg-gray-300 transition-colors"
        >
          선택 완료
        </button>
        {minTime && (
          <p className="mt-2 text-[11px] text-gray-400">오늘은 지난 시각을 고를 수 없어요.</p>
        )}
      </div>
    </SheetShell>
  );
};

// ── 날짜 선택(캘린더 바텀시트) ──
interface DateSheetProps {
  title: string;
  value: string; // YYYY-MM-DD
  min?: string;
  /** 캘린더 위의 빠른 선택 (오늘 · 내일 · 주말) */
  quick?: { label: string; date: string }[];
  onSelect: (value: string) => void;
  onClose: () => void;
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function shortDate(value: string): string {
  const [, m, d] = value.split('-').map(Number);
  return `${m}/${d}`;
}

export const DateSheet: React.FC<DateSheetProps> = ({
  title,
  value,
  min,
  quick = [],
  onSelect,
  onClose,
}) => {
  const base = value ? new Date(`${value}T00:00:00`) : min ? new Date(`${min}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // 오늘보다 앞선 달로는 넘어갈 이유가 없다
  const canGoPrev = !min || toDateStr(viewYear, viewMonth, 1) > min;

  const goMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  return (
    <SheetShell title={title} onClose={onClose}>
      <div className="px-3 pb-2">
        {quick.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {quick.map((q) => {
              const isActive = q.date === value;
              return (
                <button
                  key={q.date}
                  type="button"
                  onClick={() => onSelect(q.date)}
                  className={`px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {q.label}
                  <span className={`ml-1.5 text-xs ${isActive ? 'text-primary-500' : 'text-gray-400'}`}>
                    {shortDate(q.date)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => goMonth(-1)}
            disabled={!canGoPrev}
            className="p-2 text-gray-500 active:bg-gray-100 rounded-full disabled:text-gray-200"
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
            const isToday = dateStr === min;
            return (
              <div key={dateStr} className="flex items-center justify-center">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(dateStr)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary-500 text-white'
                      : disabled
                        ? 'text-gray-200'
                        : isToday
                          ? 'text-primary-600 ring-1 ring-primary-300 active:bg-primary-50'
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
  );
};

// ── 머무는 시간 선택 ──
interface DurationSheetProps {
  title: string;
  value: number; // 분
  /** 이 출발 시각에서 잡을 수 있는 최대 길이(분) */
  max: number;
  startDate: string;
  startTime: string;
  onConfirm: (minutes: number) => void;
  onClose: () => void;
}

const DURATION_PRESETS: { minutes: number; label: string }[] = [
  { minutes: 180, label: '가볍게' },
  { minutes: 300, label: '반나절' },
  { minutes: 480, label: '하루' },
  { minutes: 720, label: '길게' },
];

export const DurationSheet: React.FC<DurationSheetProps> = ({
  title,
  value,
  max,
  startDate,
  startTime,
  onConfirm,
  onClose,
}) => {
  const [draft, setDraft] = useState(value);

  const arrivalLabel = (minutes: number) => {
    const { endDate, endTime } = computeEnd(startDate, startTime, minutes);
    return `${endDate !== startDate ? '다음날 ' : ''}${formatTimeLabel(endTime)} 도착`;
  };

  return (
    <SheetShell title={title} onClose={onClose}>
      <div className="px-3 pb-2 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {DURATION_PRESETS.map((preset) => {
            const isActive = draft === preset.minutes;
            const disabled = preset.minutes > max;
            return (
              <button
                key={preset.minutes}
                type="button"
                disabled={disabled}
                onClick={() => setDraft(preset.minutes)}
                className={`px-3.5 py-3 rounded-xl border text-left transition-colors ${
                  disabled
                    ? 'border-gray-100 bg-gray-50 text-gray-300'
                    : isActive
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-700'
                }`}
              >
                <span className="block font-bold text-sm">
                  {preset.label} {formatDuration(preset.minutes)}
                </span>
                <span
                  className={`block text-xs mt-0.5 ${
                    disabled ? 'text-gray-300' : isActive ? 'text-primary-500' : 'text-gray-400'
                  }`}
                >
                  {disabled ? '새벽 6시를 넘겨요' : arrivalLabel(preset.minutes)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3.5 py-2.5">
          <span className="text-sm font-medium text-gray-500">30분 단위로 맞추기</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDraft((d) => Math.max(MIN_TRIP_MINUTES, d - STEP_MINUTES))}
              disabled={draft <= MIN_TRIP_MINUTES}
              aria-label="30분 줄이기"
              className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 disabled:text-gray-200"
            >
              <Minus size={15} />
            </button>
            <span className="min-w-[72px] text-center font-bold text-gray-900">
              {formatDuration(draft)}
            </span>
            <button
              type="button"
              onClick={() => setDraft((d) => Math.min(max, d + STEP_MINUTES))}
              disabled={draft >= max}
              aria-label="30분 늘리기"
              className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 disabled:text-gray-200"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        <p className="text-sm font-bold text-gray-900">
          {formatTimeLabel(startTime)} 출발 → {describeReturn(startDate, startTime, draft)}
        </p>

        <button
          type="button"
          onClick={() => onConfirm(draft)}
          className="w-full py-3 rounded-xl bg-primary-500 text-white font-bold"
        >
          {formatDuration(draft)}으로 정하기
        </button>
      </div>
    </SheetShell>
  );
};
