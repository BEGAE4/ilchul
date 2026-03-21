'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  Calendar,
  Truck,
  ArrowUp,
  ArrowDown,
  Loader2,
  Navigation,
  LocateFixed,
  RotateCcw,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import OrganicBlob from '@/shared/ui/OrganicBlob/component';
import { LogoLoader } from '@/shared/ui/LogoLoader';
import { StepIndicator } from '@/shared/ui/StepIndicator';
import { RouteMap } from './RouteMap';
import { useSurveyStore, type SurveyStep } from '@/shared/lib/stores/useSurveyStore';
import { useCourseStore } from '@/shared/lib/stores/useCourseStore';
import {
  RECOMMENDED_PLACES,
  PLACE_COORDS,
  MOCK_ADDRESSES,
} from '@/shared/data/mockData';
import type { Place } from '@/shared/types';

// ── Survey 1: 마음 상태 ──
const MIND_STATES = [
  { label: '그냥 기운이 없고 지쳤어요', emoji: '😔' },
  { label: '마음이 좀 울적하고 속상해요', emoji: '🥺' },
  { label: '답답하고 짜증이 많아졌어요', emoji: '😤' },
  { label: '무기력하고 재미가 없어요', emoji: '😐' },
  { label: '기분이 좋아요, 뭔가 하고 싶어요', emoji: '😊' },
  { label: '생각이 많아졌어요, 정리가 필요해요', emoji: '🤔' },
  { label: '아무 감정도 없이 멍한 느낌이에요', emoji: '🫥' },
];

// ── Survey 2: 이동수단 ──
const TRANSPORTS = ['대중교통', '도보', '자가용'];
const TRANSPORT_TIMES = ['1시간 이내', '상관없어요', '직접입력'];

// 30분 단위 이동 시간 옵션
const CUSTOM_TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const totalMin = (i + 1) * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return { value: `${totalMin}분`, label: `${totalMin}분` };
  if (m === 0) return { value: `${h}시간`, label: `${h}시간` };
  return { value: `${h}시간 ${m}분`, label: `${h}시간 ${m}분` };
});

// ── Survey 3: 30분 단위 시간 선택 ──
const HALF_HOURS: { value: string; label: string }[] = [];
for (let i = 0; i < 24; i++) {
  for (const m of [0, 30]) {
    const h = i.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const period = i < 12 ? '오전' : '오후';
    const dispH = i === 0 ? 12 : i <= 12 ? i : i - 12;
    HALF_HOURS.push({
      value: `${h}:${mm}`,
      label: `${period} ${dispH}시${m === 30 ? ' 30분' : ''}`,
    });
  }
}

// 스텝 번호 매핑 (StepIndicator 용)
const STEP_NUMBERS: Record<SurveyStep, number> = {
  landing: 0,
  survey1: 1,
  survey2: 2,
  survey3: 3,
  startPoint: 4,
  generating: 5,
  placeSelect: 6,
  placeDetail: 7,
  finalPlan: 8,
};
const TOTAL_STEPS = 8;

// ── 헬퍼 함수 ──
function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseStayMinutes(time: string): number {
  const match = time.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

function formatMinutes(min: number): string {
  const h = Math.floor(Math.abs(min) / 60);
  const m = Math.abs(min) % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export const CourseCreationFlow: React.FC = () => {
  const router = useRouter();
  const { addMyCourse } = useCourseStore();
  const {
    step,
    previousStep,
    surveyData,
    selectedPlaceIds,
    finalStops,
    viewingPlaceId,
    isRecalculating,
    startingPoint,
    setStep,
    setPreviousStep,
    updateSurvey,
    togglePlaceSelection,
    setFinalStops,
    setViewingPlaceId,
    setIsRecalculating,
    setStartingPoint,
    reset,
  } = useSurveyStore();

  const [customAddress, setCustomAddress] = useState('');
  const [showAddressList, setShowAddressList] = useState(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isDirectInput, setIsDirectInput] = useState(false);
  const [directInputValue, setDirectInputValue] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);

  // ── 네비게이션 ──
  const handleNext = () => {
    if (step === 'landing') setStep('survey1');
    else if (step === 'survey1') setStep('survey2');
    else if (step === 'survey2') setStep('survey3');
    else if (step === 'survey3') setStep('startPoint');
    else if (step === 'startPoint') {
      setStep('generating');
      setTimeout(() => setStep('placeSelect'), 3000);
    } else if (step === 'placeSelect') {
      const selected = RECOMMENDED_PLACES.filter((p) => selectedPlaceIds.includes(p.id));
      setFinalStops(selected);
      setStep('finalPlan');
    } else if (step === 'finalPlan') {
      const newCourse = {
        id: `my-${Date.now()}`,
        title: `${(surveyData.mindState ?? '').slice(0, 10)} 힐링 코스`,
        description: `${surveyData.transport ?? ''}으로 떠나는 나만의 힐링 여행`,
        author: '김여행',
        authorAvatar: 'https://i.pravatar.cc/150?u=me',
        thumbnail:
          finalStops[0]?.image ||
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1080&auto=format&fit=crop',
        location: finalStops[0]?.address?.split(' ').slice(0, 2).join(' ') || '서울',
        duration: `${finalStops.length}시간`,
        tags: finalStops.slice(0, 3).map((s) => `#${s.category}`),
        bookmarks: 0,
        likes: 0,
        isVerified: false,
        isPublic: false,
        ownerId: 'me',
        scheduledDate: surveyData.startDate ?? '',
        scheduledStartTime: surveyData.startTime ?? '',
        scheduledEndTime: surveyData.endTime ?? '',
        createdAt: new Date().toISOString(),
        review: '',
        stops: finalStops.map((s, i) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          time: i === 0 ? surveyData.startTime || '10:00' : `${10 + i}:00`,
          description: s.description,
          isVerified: false,
        })),
      };
      addMyCourse(newCourse);
      const savedId = newCourse.id;
      reset();
      toast.success('힐링 플랜이 생성되었어요!', {
        description: '내 코스에서 확인해보세요.',
      });
      router.push(`/my-course/${savedId}`);
    }
  };

  const hasUnsavedData = surveyData.mindState || surveyData.transport || surveyData.transportTime;

  const handleBack = () => {
    if (step === 'landing') {
      if (hasUnsavedData) {
        setShowExitModal(true);
        return;
      }
      reset();
      router.push('/');
    } else if (step === 'survey1') {
      if (hasUnsavedData) {
        setShowExitModal(true);
        return;
      }
      setStep('landing');
    } else if (step === 'survey2') setStep('survey1');
    else if (step === 'survey3') setStep('survey2');
    else if (step === 'startPoint') setStep('survey3');
    else if (step === 'placeSelect') setStep('startPoint');
    else if (step === 'finalPlan') setStep('placeSelect');
    else if (step === 'placeDetail') {
      setStep(previousStep);
      setViewingPlaceId(null);
    }
  };

  const handleRetry = () => {
    reset();
    setStep('survey1');
  };

  const openPlaceDetail = (placeId: string) => {
    setPreviousStep(step);
    setViewingPlaceId(placeId);
    setStep('placeDetail');
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    if (isRecalculating) return;
    const newStops = [...finalStops];
    if (direction === 'up' && index > 0) {
      [newStops[index], newStops[index - 1]] = [newStops[index - 1], newStops[index]];
    } else if (direction === 'down' && index < newStops.length - 1) {
      [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
    } else return;
    setIsRecalculating(true);
    setTimeout(() => {
      setFinalStops(newStops);
      setIsRecalculating(false);
    }, 800);
  };

  // ── Survey 3 유효성 검사 ──
  const today = getTodayStr();
  const survey3Validation = useMemo(() => {
    const { startDate, startTime, endDate, endTime } = surveyData;
    if (!startDate || !startTime || !endDate || !endTime)
      return { valid: false, error: '' };
    if (startDate < today) return { valid: false, error: '과거 날짜는 선택할 수 없어요.' };
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      return { valid: false, error: '올바른 날짜를 입력해주세요.' };
    const diffMin = (end.getTime() - start.getTime()) / (1000 * 60);
    if (diffMin <= 0) return { valid: false, error: '종료 시간은 시작 시간 이후여야 해요.' };
    if (diffMin > 24 * 60)
      return { valid: false, error: '입력해주신 시간이 당일치기 기준(24시간)을 초과해요.' };
    return { valid: true, error: '' };
  }, [surveyData, today]);

  // ── 장소 선택 시간 예상 ──
  const estimatedTotalMin = useMemo(() => {
    const selected = RECOMMENDED_PLACES.filter((p) => selectedPlaceIds.includes(p.id));
    const stayTotal = selected.reduce((sum, p) => sum + parseStayMinutes(p.time), 0);
    const travelTotal = Math.max(0, selected.length - 1) * 15;
    return stayTotal + travelTotal;
  }, [selectedPlaceIds]);

  const availableMin = useMemo(() => {
    const { startDate, startTime, endDate, endTime } = surveyData;
    if (!startDate || !startTime || !endDate || !endTime) return 0;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffMin = (end.getTime() - start.getTime()) / (1000 * 60);
    return diffMin > 0 ? diffMin : 0;
  }, [surveyData]);

  const timeDiffMin = availableMin - estimatedTotalMin;

  // ── 이동 시간 계산 (finalPlan 용) ──
  const getTravelMinutes = (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ) => {
    const dist = Math.sqrt(Math.pow(from.lat - to.lat, 2) + Math.pow(from.lng - to.lng, 2));
    return Math.round(dist * 500) + 5;
  };

  // ── 공통 Header 컴포넌트 ──
  const Header = ({
    onBack,
    title = '',
    showStep = false,
  }: {
    onBack: () => void;
    title?: string;
    showStep?: boolean;
  }) => (
    <div className="bg-white sticky top-0 z-10">
      <div className="flex items-center p-4 border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-gray-700 rounded-full active:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold text-lg ml-2">{title}</span>
      </div>
      {showStep && (
        <StepIndicator
          currentStep={STEP_NUMBERS[step] ?? 0}
          totalSteps={TOTAL_STEPS}
        />
      )}
    </div>
  );

  // ════════════════════════════════════════════
  // (1) Landing
  // ════════════════════════════════════════════
  // ── 이탈 확인 모달 JSX ──
  const exitModal = showExitModal && (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-[300px]">
        <h2 className="font-bold text-lg text-gray-900 mb-2">나가시겠어요?</h2>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          나가면 입력한 내용이 사라져요.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExitModal(false)}
            className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-sm text-gray-600"
          >
            취소
          </button>
          <button
            onClick={() => {
              setShowExitModal(false);
              reset();
              router.push('/');
            }}
            className="flex-1 py-3 bg-sky-500 font-bold rounded-xl text-sm text-white"
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 'landing') {
    return (
      <div className="flex flex-col h-full bg-white">
        <Header onBack={handleBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50 via-blue-50 to-white -z-10" />
          <OrganicBlob state="idle" className="mb-6" />
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            지금 나에게 필요한
            <br />
            힐링 방법을 알아볼까요?
          </h1>
          <p className="text-gray-500 mb-12 leading-relaxed">
            먼저 간단한 설문을 통해
            <br />
            맞춤 여행 코스를 추천해드릴게요.
          </p>
          <button
            onClick={handleNext}
            className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-200 active:scale-[0.98] transition-transform"
          >
            시작하기
          </button>
        </div>
        {exitModal}
      </div>
    );
  }

  // ════════════════════════════════════════════
  // (2) Survey 1 — 마음 상태
  // ════════════════════════════════════════════
  if (step === 'survey1') {
    return (
      <div className="flex flex-col h-full bg-white">
        <Header onBack={handleBack} title="나의 상태 확인" showStep />
        <div className="flex-1 px-5 pt-5 pb-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-1 text-gray-900">요즘 마음 상태는 어떤가요?</h2>
          <p className="text-sm text-gray-400 mb-5">
            현재 상태가 없다면 직접 입력할 수 있어요.
          </p>

          <div className="flex flex-col gap-2.5">
            {MIND_STATES.map((state) => {
              const isActive = surveyData.mindState === state.label;
              return (
                <button
                  key={state.label}
                  onClick={() => {
                    updateSurvey('mindState', state.label);
                    setIsDirectInput(false);
                    setDirectInputValue('');
                  }}
                  className={`w-full py-3.5 px-5 rounded-full border-2 text-center transition-all ${
                    isActive
                      ? 'border-sky-400 bg-sky-50 text-sky-700'
                      : 'border-gray-100 bg-white text-gray-600'
                  }`}
                >
                  {state.label} {state.emoji}
                </button>
              );
            })}

            {!isDirectInput ? (
              <button
                onClick={() => {
                  setIsDirectInput(true);
                  updateSurvey('mindState', '');
                }}
                className="w-full py-3.5 px-5 rounded-full border-2 border-gray-100 bg-white text-gray-600 text-center"
              >
                직접 입력하기
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <input
                  type="text"
                  value={directInputValue}
                  onChange={(e) => {
                    setDirectInputValue(e.target.value);
                    updateSurvey('mindState', e.target.value);
                  }}
                  placeholder="지금 느끼는 감정을 적어주세요"
                  maxLength={30}
                  autoFocus
                  className="w-full py-3.5 px-5 rounded-full border-2 border-sky-400 bg-sky-50 text-sky-700 text-center outline-none placeholder:text-sky-300"
                />
                <div className="flex items-start gap-1.5 px-2">
                  <AlertCircle size={12} className="text-gray-300 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-gray-400 leading-snug">
                    예시: &ldquo;잠이 안 와서 피곤해요&rdquo;, &ldquo;새로운 자극이 필요해요&rdquo;
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleNext}
            disabled={!surveyData.mindState}
            className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all"
          >
            선택 완료
          </button>
        </div>
        {exitModal}
      </div>
    );
  }

  // ════════════════════════════════════════════
  // (3) Survey 2 — 이동 수단 및 시간
  // ════════════════════════════════════════════
  if (step === 'survey2') {
    const isCustomTime =
      surveyData.transportTime === '직접입력' ||
      CUSTOM_TIME_OPTIONS.some((o) => o.value === surveyData.transportTime);
    const showCustomPicker =
      isCustomTime && !['1시간 이내', '상관없어요', ''].includes(surveyData.transportTime ?? '');

    return (
      <div className="flex flex-col h-full bg-white">
        <Header onBack={handleBack} title="이동 수단 및 시간" showStep />
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6">
            Q2. 희망하는 이동 수단과
            <br />
            이동 시간을 선택해주세요.
          </h2>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-500 mb-3">이동 수단</h3>
            <div className="flex flex-wrap gap-2">
              {TRANSPORTS.map((t) => (
                <button
                  key={t}
                  onClick={() => updateSurvey('transport', t)}
                  className={`px-4 py-3 rounded-lg border font-medium text-sm transition-all ${
                    surveyData.transport === t
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-3">이동 시간</h3>
            <div className="flex flex-col gap-2">
              {TRANSPORT_TIMES.map((time) => (
                <button
                  key={time}
                  onClick={() => updateSurvey('transportTime', time)}
                  className={`px-4 py-3 rounded-lg border font-medium text-left text-sm transition-all ${
                    (time === '직접입력' && isCustomTime) || surveyData.transportTime === time
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {(surveyData.transportTime === '직접입력' || showCustomPicker) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">30분 단위로 선택 (최대 12시간)</p>
                    <select
                      value={
                        CUSTOM_TIME_OPTIONS.some((o) => o.value === surveyData.transportTime)
                          ? surveyData.transportTime
                          : ''
                      }
                      onChange={(e) => updateSurvey('transportTime', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white text-base appearance-none cursor-pointer outline-none focus:border-sky-500 transition-colors"
                    >
                      <option value="" disabled>시간을 선택해주세요</option>
                      {CUSTOM_TIME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleNext}
            disabled={
              !surveyData.transport ||
              !surveyData.transportTime ||
              surveyData.transportTime === '직접입력'
            }
            className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all"
          >
            선택 완료
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // (4) Survey 3 — 당일치기 일정
  // ════════════════════════════════════════════
  if (step === 'survey3') {
    return (
      <div className="flex flex-col h-full bg-white">
        <Header onBack={handleBack} title="일정 선택" showStep />
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-2">
            Q3. 당일치기 여행 일정을
            <br />
            설정해주세요.
          </h2>
          <p className="text-sm text-gray-400 mb-6">최대 24시간 이내의 당일치기 일정을 선택해주세요.</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Calendar size={15} className="text-sky-500" />
                여행 시작
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={surveyData.startDate ?? ''}
                  min={today}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    updateSurvey('startDate', newStart);
                    if (!surveyData.endDate || surveyData.endDate < newStart) {
                      updateSurvey('endDate', newStart);
                    }
                  }}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-base focus:border-sky-500 outline-none transition-colors"
                />
                <select
                  value={surveyData.startTime ?? ''}
                  onChange={(e) => updateSurvey('startTime', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-base appearance-none cursor-pointer focus:border-sky-500 outline-none transition-colors"
                >
                  <option value="">시간 선택</option>
                  {HALF_HOURS.map((h) => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Clock size={15} className="text-orange-500" />
                여행 종료
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={surveyData.endDate ?? ''}
                  min={surveyData.startDate || today}
                  onChange={(e) => updateSurvey('endDate', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-base focus:border-sky-500 outline-none transition-colors"
                />
                <select
                  value={surveyData.endTime ?? ''}
                  onChange={(e) => updateSurvey('endTime', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-base appearance-none cursor-pointer focus:border-sky-500 outline-none transition-colors"
                >
                  <option value="">시간 선택</option>
                  {HALF_HOURS.map((h) => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {surveyData.startTime && surveyData.endTime && surveyData.startDate && surveyData.endDate && survey3Validation.valid && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-sky-50 p-4 rounded-xl border border-sky-100"
              >
                <div className="flex items-center gap-2 text-sky-700 font-bold text-sm mb-1">
                  <Timer size={16} />총 여행 시간
                </div>
                <div className="text-sky-600 text-lg font-bold">
                  {(() => {
                    const start = new Date(`${surveyData.startDate}T${surveyData.startTime}`);
                    const end = new Date(`${surveyData.endDate}T${surveyData.endTime}`);
                    const diffMin = (end.getTime() - start.getTime()) / (1000 * 60);
                    return formatMinutes(diffMin);
                  })()}
                </div>
              </motion.div>
            )}

            {survey3Validation.error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2 bg-red-50 p-3 rounded-xl border border-red-100"
              >
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <span className="text-sm text-red-500">{survey3Validation.error}</span>
              </motion.div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleNext}
            disabled={!survey3Validation.valid}
            className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all shadow-lg shadow-sky-100"
          >
            다음으로
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // (5) Generating Animation
  // ════════════════════════════════════════════
  if (step === 'generating') {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-blue-50 to-white -z-10" />
        <div className="mb-8">
          <LogoLoader />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            김여행님에게 맞는 곳을<br />찾는 중입니다.
          </h2>
          <p className="text-gray-500 text-sm mb-8">잠시만 기다려주세요...</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mt-4 mx-auto"
          >
            <RotateCcw size={14} />
            다시 하기
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // (6) Starting Point Selection
  // ════════════════════════════════════════════
  if (step === 'startPoint') {
    const filteredAddresses = customAddress.trim()
      ? MOCK_ADDRESSES.filter((a) => a.label.includes(customAddress.trim()))
      : MOCK_ADDRESSES;

    return (
      <div className="flex flex-col h-full bg-white">
        <Header onBack={handleBack} title="출발지 설정" showStep />
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 pb-3">
            <h2 className="text-xl font-bold mb-2 text-gray-900">어디에서 출발하시나요?</h2>
            <p className="text-sm text-gray-500 mb-3">
              지도에서 출발지를 선택하거나 검색해주세요.
            </p>
            <div className="flex justify-end mb-3">
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full"
              >
                <RotateCcw size={12} />
                설문 다시 하기
              </button>
            </div>
          </div>

          {/* 지도 프리뷰 */}
          <div className="px-4 pb-3">
            <div className="relative rounded-xl overflow-hidden border-2 border-indigo-100">
              <RouteMap
                startingPoint={startingPoint}
                stops={[]}
                showRoute={false}
                className="h-48"
              />
              <div className="absolute top-3 left-3 right-3 z-10">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-indigo-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">
                        {startingPoint.address || '출발지를 선택해주세요'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 현재 위치 버튼 + 검색 */}
          <div className="px-5 space-y-3">
            <button
              onClick={() => {
                setGeoStatus('loading');
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      const mockAddress = '서울 용산구 한강대로 405 서울역';
                      setGeoStatus('success');
                      setCustomAddress(mockAddress);
                      setStartingPoint({
                        type: 'current',
                        address: mockAddress,
                        coord: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                      });
                    },
                    () => {
                      setGeoStatus('error');
                      toast.error('현재 위치를 가져올 수 없습니다', {
                        description: '직접 입력으로 출발지를 설정해주세요.',
                      });
                    },
                    { timeout: 5000 }
                  );
                } else {
                  setGeoStatus('error');
                  toast.error('GPS를 사용할 수 없습니다');
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-indigo-500 text-white font-bold active:bg-indigo-600 transition-colors"
            >
              {geoStatus === 'loading' ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  위치 확인 중...
                </>
              ) : (
                <>
                  <LocateFixed size={20} />
                  현재 위치로 설정
                </>
              )}
            </button>

            {/* 검색 입력 */}
            <div>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => {
                    setCustomAddress(e.target.value);
                    setShowAddressList(true);
                  }}
                  onFocus={() => setShowAddressList(true)}
                  placeholder="역, 주소, 장소명으로 검색"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base focus:border-indigo-400 outline-none transition-all"
                />
              </div>

              {showAddressList && customAddress && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
                >
                  {filteredAddresses.length > 0 ? (
                    filteredAddresses.map((addr) => (
                      <button
                        key={addr.label}
                        onClick={() => {
                          setCustomAddress(addr.label);
                          setStartingPoint({
                            type: 'custom',
                            address: addr.label,
                            coord: addr.coord,
                          });
                          setShowAddressList(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 border-b border-gray-50 last:border-b-0"
                      >
                        <MapPin size={14} className="text-indigo-400 shrink-0" />
                        <span className="text-sm text-gray-700">{addr.label}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      검색 결과가 없습니다
                    </div>
                  )}
                </motion.div>
              )}

              {!customAddress && !showAddressList && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-bold text-gray-500 px-1">추천 출발지</div>
                  <div className="grid grid-cols-2 gap-2">
                    {MOCK_ADDRESSES.slice(0, 4).map((addr) => (
                      <button
                        key={addr.label}
                        onClick={() => {
                          setCustomAddress(addr.label);
                          setStartingPoint({
                            type: 'custom',
                            address: addr.label,
                            coord: addr.coord,
                          });
                        }}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-left hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                      >
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-700 font-medium truncate">
                          {addr.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleNext}
            disabled={!startingPoint.address}
            className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all shadow-lg shadow-sky-100"
          >
            다음으로
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // (7) Place Selection
  // ════════════════════════════════════════════
  if (step === 'placeSelect') {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <Header onBack={handleBack} title="장소 선택" showStep />

        <div className="px-4 pt-3 pb-1">
          <RouteMap
            startingPoint={startingPoint}
            stops={RECOMMENDED_PLACES.filter((p) => selectedPlaceIds.includes(p.id))}
            showRoute={false}
            className="h-44"
          />
        </div>

        <div className="bg-white p-4 pb-2 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">추천 결과입니다</h2>
          <p className="text-sm text-gray-500">가고 싶은 장소를 선택해주세요.</p>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 pb-32">
          {RECOMMENDED_PLACES.map((place) => {
            const isSelected = selectedPlaceIds.includes(place.id);
            return (
              <div
                key={place.id}
                onClick={() => togglePlaceSelection(place.id)}
                className={`relative bg-white p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 shadow-md ring-1 ring-sky-500'
                    : 'border-gray-100 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded mb-1 inline-block">
                      {place.category}
                    </span>
                    <h3 className="font-bold text-gray-900">{place.name}</h3>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'bg-sky-500 border-sky-500' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{place.description}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                  <div className="flex items-center text-xs text-gray-400 gap-1">
                    <Clock size={12} />
                    <span>추천 체류 {place.time}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPlaceDetail(place.id);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded"
                  >
                    <MapPin size={12} />
                    상세 보기
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 예상 소요 시간 바 + 버튼 */}
        <div className="bg-white border-t border-gray-100 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)]">
          {selectedPlaceIds.length > 0 && availableMin > 0 && (
            <div className="px-4 pt-3 pb-1">
              <div
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm ${
                  timeDiffMin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Timer size={14} />
                  <span className="font-bold">예상 {formatMinutes(estimatedTotalMin)}</span>
                  <span className="text-xs opacity-70">/ 여행 {formatMinutes(availableMin)}</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    timeDiffMin >= 0
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {timeDiffMin >= 0
                    ? `${formatMinutes(timeDiffMin)} 여유`
                    : `${formatMinutes(Math.abs(timeDiffMin))} 초과`}
                </span>
              </div>
            </div>
          )}
          <div className="p-4 pt-2">
            <button
              onClick={handleNext}
              disabled={selectedPlaceIds.length === 0}
              className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all"
            >
              선택 완료 ({selectedPlaceIds.length})
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // (8) Place Detail
  // ════════════════════════════════════════════
  if (step === 'placeDetail') {
    const place = RECOMMENDED_PLACES.find((p) => p.id === viewingPlaceId);
    if (!place) {
      handleBack();
      return null;
    }
    const isSelected = selectedPlaceIds.includes(place.id);

    return (
      <div className="flex flex-col h-full bg-white">
        <div className="relative h-64 w-full shrink-0">
          <Image
            src={place.image}
            alt={place.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between bg-gradient-to-b from-black/40 to-transparent">
            <button
              onClick={handleBack}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded mb-2 inline-block">
              {place.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{place.name}</h1>

            <div className="flex gap-2 mb-6">
              {place.tags.map((tag, i) => (
                <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm font-bold text-gray-900">주소</div>
                  <div className="text-sm text-gray-500">{place.address}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm font-bold text-gray-900">추천 체류 시간</div>
                  <div className="text-sm text-gray-500">{place.time}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-[18px] flex justify-center text-gray-400 font-bold text-xs mt-0.5">
                  Tel
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">전화번호</div>
                  <div className="text-sm text-gray-500">{place.phone}</div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2">장소 소개</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{place.description}</p>
            </div>
          </div>
        </div>

        {previousStep === 'placeSelect' && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <button
              onClick={() => {
                togglePlaceSelection(place.id);
                handleBack();
              }}
              className={`w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${
                isSelected
                  ? 'bg-red-50 text-red-500 border border-red-100'
                  : 'bg-sky-500 text-white shadow-lg shadow-sky-200'
              }`}
            >
              {isSelected ? '선택 해제하기' : '이 장소 선택하기'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════
  // (9) Final Plan
  // ════════════════════════════════════════════
  if (step === 'finalPlan') {
    return (
      <div className="flex flex-col h-full bg-gray-50 relative">
        <Header onBack={handleBack} title="나만의 힐링 플랜" showStep />

        <div className="bg-white p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg">코스 일정표</h2>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded">
              총 {finalStops.length}개 장소
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{surveyData.startDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck size={14} />
              <span>{surveyData.transport} 이동</span>
            </div>
            <div className="flex items-center gap-1">
              <Navigation size={14} />
              <span>{startingPoint.address}</span>
            </div>
          </div>
        </div>

        <div className="px-4 pt-3 pb-1">
          <RouteMap
            startingPoint={startingPoint}
            stops={finalStops}
            showRoute
            className="h-48"
          />
        </div>

        <div className="flex-1 p-4 overflow-y-auto relative">
          {isRecalculating && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-sky-500 mb-2" size={32} />
              <p className="text-sm font-bold text-gray-600">최적 경로 재계산 중...</p>
            </div>
          )}

          <div className="space-y-4">
            {/* 출발지 */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Navigation size={12} className="text-white" />
                </div>
                <div className="w-0.5 flex-1 bg-indigo-200 my-1" />
              </div>
              <div className="pb-2 flex-1">
                <div className="text-sm font-bold text-indigo-600">출발지</div>
                <div className="text-xs text-gray-500">
                  {startingPoint.address} · {surveyData.startTime} 출발
                </div>
                {finalStops.length > 0 && PLACE_COORDS[finalStops[0].id] && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-indigo-400">
                    <Truck size={10} />
                    <span>
                      {getTravelMinutes(startingPoint.coord, PLACE_COORDS[finalStops[0].id])}분 소요 예상
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 정거장들 */}
            {finalStops.map((stop, index) => {
              const prevCoord =
                index === 0
                  ? startingPoint.coord
                  : PLACE_COORDS[finalStops[index - 1].id] || startingPoint.coord;
              const currCoord = PLACE_COORDS[stop.id];
              const nextCoord = index < finalStops.length - 1 ? PLACE_COORDS[finalStops[index + 1].id] : null;
              const travelFromPrev = currCoord ? getTravelMinutes(prevCoord, currCoord) : 15;
              const travelToNext = nextCoord && currCoord ? getTravelMinutes(currCoord, nextCoord) : null;

              return (
                <div
                  key={stop.id}
                  className="flex gap-3 group cursor-pointer"
                  onClick={() => openPlaceDetail(stop.id)}
                >
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold z-10 shadow-sm">
                      {index + 1}
                    </div>
                    {index < finalStops.length - 1 && (
                      <div className="w-0.5 flex-1 bg-sky-200 my-1" />
                    )}
                  </div>

                  <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-xs text-sky-600 font-bold mb-0.5">
                          {index === 0
                            ? `${surveyData.startTime || '10:00'} 이후 도착`
                            : `${travelFromPrev}분 이동 후 도착`}
                        </div>
                        <h3 className="font-bold text-gray-900">{stop.name}</h3>
                      </div>
                      <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => moveStop(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-sky-500 disabled:opacity-30"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => moveStop(index, 'down')}
                          disabled={index === finalStops.length - 1}
                          className="p-1 text-gray-400 hover:text-sky-500 disabled:opacity-30"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>추천 체류 {stop.time}</span>
                      </div>
                      {travelToNext !== null && (
                        <div className="flex items-center gap-1">
                          <Truck size={12} />
                          <span>다음 장소까지 {travelToNext}분</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
          <button
            onClick={handleNext}
            className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} />
            힐링 플랜 생성 완료
          </button>
        </div>
      </div>
    );
  }

  return null;
};
