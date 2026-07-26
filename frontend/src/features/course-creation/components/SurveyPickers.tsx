'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
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
      className="fixed inset-0 z-[60] bg-black/40"
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
