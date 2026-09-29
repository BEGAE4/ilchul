'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { DateSheet, DurationSheet, TimeSheet } from './SurveyPickers';
import {
  ceilToHalfHour,
  clampDuration,
  computeEnd,
  defaultSchedule,
  describeReturn,
  durationOf,
  formatDuration,
  formatTimeLabel,
  maxDurationFor,
  weekendDayFor,
} from '../utils/schedule';

export interface ScheduleValue {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

interface ScheduleSentenceProps {
  /** 'YYYY-MM-DD' */
  today: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  onChange: (next: ScheduleValue) => void;
}

type OpenSheet = 'date' | 'time' | 'duration' | null;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const next = new Date(y, m - 1, d + days);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
}

function dayLabel(dateStr: string, today: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  if (dateStr === today) return `오늘 ${m}/${d}`;
  if (dateStr === addDays(today, 1)) return `내일 ${m}/${d}`;
  const [y] = dateStr.split('-').map(Number);
  return `${m}월 ${d}일 (${WEEKDAYS[new Date(y, m - 1, d).getDay()]})`;
}

// 자주 가는 일정 — 누르면 문장의 칸이 한 번에 채워진다
const SUGGESTIONS: { key: string; label: string; startTime: string; durationMin: number }[] = [
  { key: 'morning', label: '오전 반나절', startTime: '09:00', durationMin: 240 },
  { key: 'afternoon', label: '오후', startTime: '13:00', durationMin: 300 },
  { key: 'allday', label: '하루 종일', startTime: '09:00', durationMin: 720 },
  { key: 'night', label: '야간', startTime: '18:00', durationMin: 330 },
];

// 일정 선택(Q3)을 한 문장으로 답하게 한다: "내일 / 오전 9시에 출발해서 / 8시간 동안 다녀올게요."
//
// 이전 화면은 시간대 프리셋 4개 + 접힌 4칸 직접 설정이었다. 저녁에 들어오면 프리셋이 전부
// '시간이 지났어요'로 죽어 있었고, 프리셋에 없는 시각은 시계 시트를 시작·종료 두 번 열어야 했으며,
// 종료가 자정을 넘는지는 사용자가 '당일 / 다음날 새벽' 토글로 직접 알려줘야 했다.
// 끝나는 시각을 묻지 않고 '언제 출발 · 몇 시간'만 물으면 이 문제들이 한꺼번에 없어진다.
// 도착은 계산해서 문장 아래에 보여주고, 저장하는 값의 모양(시작·종료 일시)은 그대로 둔다.
export const ScheduleSentence: React.FC<ScheduleSentenceProps> = ({
  today,
  startDate,
  startTime,
  endDate,
  endTime,
  onChange,
}) => {
  const [open, setOpen] = useState<OpenSheet>(null);

  // 오늘 고를 수 있는 가장 이른 칸. 밤 11시 반을 넘기면 오늘은 남은 칸이 없다.
  const nowSlot = ceilToHalfHour(new Date());
  const earliestDate = nowSlot ? today : addDays(today, 1);

  const durationMin = durationOf(startDate, startTime, endDate, endTime);
  const isFilled = !!startDate && !!startTime && durationMin !== null && durationMin > 0;

  const commit = (date: string, time: string, duration: number) => {
    const clamped = clampDuration(duration, time);
    onChange({ startDate: date, startTime: time, ...computeEnd(date, time, clamped) });
  };

  // 처음 들어오면 문장을 채워 둔다 — 빈 칸 세 개보다 고칠 문장 하나가 빠르다
  useEffect(() => {
    if (isFilled) return;
    const d = defaultSchedule(new Date());
    commit(d.startDate, d.startTime, d.durationMin);
    // 마운트 시 한 번만. 이후에는 사용자가 고른 값을 덮어쓰지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isFilled) return null;

  const isToday = startDate === today;

  const changeDate = (date: string) => {
    // 오늘로 옮겼는데 출발 시각이 이미 지났으면 '지금'으로 당긴다
    const time = date === today && nowSlot && startTime < nowSlot ? nowSlot : startTime;
    commit(date, time, durationMin);
    setOpen(null);
  };

  const changeTime = (time: string) => {
    commit(startDate, time, durationMin);
    setOpen(null);
  };

  const changeDuration = (minutes: number) => {
    commit(startDate, startTime, minutes);
    setOpen(null);
  };

  const weekend = weekendDayFor(today);
  const suggestions = [
    ...SUGGESTIONS.map((s) => ({ ...s, date: startDate })),
    {
      key: 'weekend',
      label: `${weekend.label} 하루`,
      date: weekend.date,
      startTime: '09:00',
      durationMin: 720,
    },
  ].filter((s) => !(s.date === today && nowSlot !== null && s.startTime < nowSlot) && s.date >= earliestDate);

  const quickDates = [
    ...(nowSlot ? [{ label: '오늘', date: today }] : []),
    { label: '내일', date: addDays(today, 1) },
    ...(weekend.date !== addDays(today, 1) ? [{ label: weekend.label, date: weekend.date }] : []),
  ];

  const tokenClass = (isOpen: boolean) =>
    `inline-flex items-center gap-1 pl-3 pr-2.5 py-2 rounded-[10px] bg-white text-lg font-bold text-primary-700 transition-colors active:bg-primary-50 ${
      isOpen ? 'border-2 border-primary-500' : 'border border-primary-300 m-px'
    }`;

  return (
    <div className="space-y-6">
      <div className="bg-primary-50 rounded-2xl p-5 space-y-3">
        <div>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label={`날짜 ${dayLabel(startDate, today)}, 바꾸기`}
            onClick={() => setOpen('date')}
            className={tokenClass(open === 'date')}
          >
            {dayLabel(startDate, today)}
            <ChevronDown size={15} className="text-primary-500" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label={`출발 시각 ${formatTimeLabel(startTime)}, 바꾸기`}
            onClick={() => setOpen('time')}
            className={tokenClass(open === 'time')}
          >
            {formatTimeLabel(startTime)}
            <ChevronDown size={15} className="text-primary-500" />
          </button>
          <span className="text-lg font-medium text-gray-900">에 출발해서</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label={`머무는 시간 ${formatDuration(durationMin)}, 바꾸기`}
            onClick={() => setOpen('duration')}
            className={tokenClass(open === 'duration')}
          >
            {formatDuration(durationMin)}
            <ChevronDown size={15} className="text-primary-500" />
          </button>
          <span className="text-lg font-medium text-gray-900">동안 다녀올게요.</span>
        </div>

        <div className="border-t border-primary-200 pt-3 flex items-center gap-1.5 text-sm font-semibold text-primary-600">
          <ArrowRight size={14} className="shrink-0" />
          <span aria-live="polite">{describeReturn(startDate, startTime, durationMin)}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
          <Sparkles size={14} className="text-accent-500" />
          이렇게도 많이 가요
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => {
            const isActive =
              s.date === startDate && s.startTime === startTime && s.durationMin === durationMin;
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => commit(s.date, s.startTime, s.durationMin)}
                className={`px-3.5 py-2 rounded-full border text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400">누르면 위 문장의 칸이 한 번에 채워져요.</p>
      </div>

      {open === 'date' && (
        <DateSheet
          title="언제 갈까요?"
          value={startDate}
          min={earliestDate}
          quick={quickDates}
          onSelect={changeDate}
          onClose={() => setOpen(null)}
        />
      )}
      {open === 'time' && (
        <TimeSheet
          title="몇 시에 출발할까요?"
          value={startTime}
          minTime={isToday && nowSlot ? nowSlot : undefined}
          nowOption={
            isToday && nowSlot ? { value: nowSlot, label: formatTimeLabel(nowSlot) } : undefined
          }
          onConfirm={changeTime}
          onClose={() => setOpen(null)}
        />
      )}
      {open === 'duration' && (
        <DurationSheet
          title="얼마나 다녀올까요?"
          value={durationMin}
          max={maxDurationFor(startTime)}
          startDate={startDate}
          startTime={startTime}
          onConfirm={changeDuration}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
};

