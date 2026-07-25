'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Bus,
  Footprints,
  Car,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { LogoLoader } from '@/shared/ui/LogoLoader';
import { StepIndicator } from '@/shared/ui/StepIndicator';
import { RouteMap, getStopCoord } from './RouteMap';
import { SelectField, DateField } from './SurveyPickers';
import { useSurveyStore, type SurveyStep } from '@/shared/lib/stores/useSurveyStore';
import { planApi, type PlanPreviewResponse } from '@/features/plan';
import { recommendPlaces } from '@/features/place/api/place.api';
import { RECOMMENDED_PLACES, MOCK_ADDRESSES } from '@/shared/data/mockData';
import {
  useKakaoMapLoader,
  coordToAddress,
  searchPlacesByKeyword,
  type KeywordPlaceResult,
} from '@/shared/lib/kakao';
import type { Place } from '@/shared/types';

// 장소 추천 응답(POST /api/place/recommend)은 서버 스키마가 아직 확정되지 않아
// 방어적으로 파싱하고, 실패/빈 배열이면 기본 추천 목록(RECOMMENDED_PLACES)으로 대체한다.
function mapRecommendedPlaces(data: unknown): Place[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((raw): Place | null => {
      if (!raw || typeof raw !== 'object') return null;
      const item = raw as Record<string, unknown>;
      const id = item.placeId ?? item.id;
      const name = item.placeName ?? item.name;
      if (id === undefined || id === null || typeof name !== 'string') return null;
      // 좌표: 응답이 location { x, y } 또는 평면 x/y 어느 쪽이든 수용 (x=경도, y=위도)
      const loc =
        item.location && typeof item.location === 'object'
          ? (item.location as Record<string, unknown>)
          : undefined;
      const x = typeof item.x === 'number' ? item.x : typeof loc?.x === 'number' ? loc.x : undefined;
      const y = typeof item.y === 'number' ? item.y : typeof loc?.y === 'number' ? loc.y : undefined;
      return {
        id: String(id),
        name,
        category:
          typeof item.categoryName === 'string'
            ? item.categoryName
            : typeof item.category === 'string'
              ? item.category
              : '추천 장소',
        time: typeof item.time === 'string' ? item.time : '60분',
        description: typeof item.description === 'string' ? item.description : '',
        image:
          typeof item.placeImageUrl === 'string'
            ? item.placeImageUrl
            : typeof item.image === 'string'
              ? item.image
              : '',
        address:
          typeof item.addressName === 'string'
            ? item.addressName
            : typeof item.address === 'string'
              ? item.address
              : '',
        phone: typeof item.phone === 'string' ? item.phone : '',
        tags: Array.isArray(item.tags) ? item.tags.filter((t): t is string => typeof t === 'string') : [],
        ...(x !== undefined && y !== undefined ? { coord: { lat: y, lng: x } } : {}),
      };
    })
    .filter((p): p is Place => p !== null);
}

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
const TRANSPORTS: { label: string; icon: typeof Bus }[] = [
  { label: '대중교통', icon: Bus },
  { label: '도보', icon: Footprints },
  { label: '자가용', icon: Car },
];
// 이동수단마다 체감 이동 한도가 달라 도보 기준 짧은 구간부터 자가용 기준 장거리까지 단계별로 제공
const TRANSPORT_TIMES = ['30분 이내', '1시간 이내', '2시간 이내', '상관없어요', '직접입력'];

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
  const [isSaving, setIsSaving] = useState(false);
  // 최종 플랜 단계의 서버 계산 프리뷰 (소요시간/이동거리)
  const [serverPreview, setServerPreview] = useState<PlanPreviewResponse | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  // 설문 기반 장소 추천 결과 (POST /api/place/recommend), 실패 시 기본 목록 유지
  const [recommendedPlaces, setRecommendedPlaces] = useState<Place[]>(RECOMMENDED_PLACES);
  // 카카오맵 SDK 로드 상태 — 출발지 검색/역지오코딩에 services 라이브러리 사용
  const [isKakaoLoading, kakaoError] = useKakaoMapLoader();
  // 출발지 키워드 검색 결과 (카카오 로컬 Places.keywordSearch)
  const [addressResults, setAddressResults] = useState<KeywordPlaceResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // 출발지 검색어 디바운스 → 카카오 키워드 장소 검색
  useEffect(() => {
    if (step !== 'startPoint') return;
    const query = customAddress.trim();
    if (!query || isKakaoLoading || kakaoError) {
      setAddressResults([]);
      return;
    }
    const timer = setTimeout(() => {
      void (async () => {
        setIsSearchingAddress(true);
        const results = await searchPlacesByKeyword(query);
        setAddressResults(results);
        setIsSearchingAddress(false);
      })();
    }, 300);
    return () => clearTimeout(timer);
  }, [customAddress, step, isKakaoLoading, kakaoError]);

  // ── 네비게이션 ──
  const handleNext = () => {
    if (step === 'landing') setStep('survey1');
    else if (step === 'survey1') setStep('survey2');
    else if (step === 'survey2') setStep('survey3');
    else if (step === 'survey3') setStep('startPoint');
    else if (step === 'startPoint') {
      setStep('generating');
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1500));
      void (async () => {
        try {
          const [result] = await Promise.all([
            recommendPlaces({
              emotion: surveyData.mindState ?? '',
              startTime: surveyData.startTime ?? '',
              endTime: surveyData.endTime ?? '',
              transport: surveyData.transport ?? '',
              location: { x: startingPoint.coord.lng, y: startingPoint.coord.lat },
            }),
            minDelay,
          ]);
          const mapped = mapRecommendedPlaces(result);
          if (mapped.length > 0) setRecommendedPlaces(mapped);
        } catch (err) {
          console.error('장소 추천 실패, 기본 추천 목록으로 대체합니다:', err);
          await minDelay;
        } finally {
          setStep('placeSelect');
        }
      })();
    } else if (step === 'placeSelect') {
      const selected = recommendedPlaces.filter((p) => selectedPlaceIds.includes(p.id));
      setFinalStops(selected);
      setStep('finalPlan');
      // 서버 계산 프리뷰 조회 (POST /api/plan-place/preview) — 실패해도 화면 진행은 유지
      setServerPreview(null);
      setPreviewFailed(false);
      void (async () => {
        try {
          const numericPlaces = selected
            .map((p, i) => ({ placeId: Number(p.id), order: i + 1 }))
            .filter((p) => Number.isInteger(p.placeId));
          if (numericPlaces.length === 0) {
            setPreviewFailed(true);
            return;
          }
          const preview = await planApi.createPlanPreview({
            planTitle: `${(surveyData.mindState ?? '').slice(0, 10)} 힐링 플랜`,
            planDescription: `${surveyData.transport ?? ''}으로 떠나는 나만의 힐링 여행`,
            isPlanVisible: false,
            ...(startingPoint.address
              ? {
                  departurePoint: {
                    name: startingPoint.address,
                    address: startingPoint.address,
                    x: startingPoint.coord.lng,
                    y: startingPoint.coord.lat,
                  },
                }
              : {}),
            ...(surveyData.startDate
              ? {
                  tripStartDate: `${surveyData.startDate}T${surveyData.startTime || '00:00'}:00`,
                  tripEndDate: `${surveyData.startDate}T${surveyData.endTime || '23:59'}:00`,
                }
              : {}),
            places: numericPlaces,
          });
          setServerPreview(preview);
        } catch (err) {
          console.error('플랜 생성 프리뷰 실패:', err);
          setPreviewFailed(true);
        }
      })();
    } else if (step === 'finalPlan') {
      // v5: POST /api/plan/create 한 번으로 출발지/일정/장소까지 일괄 등록.
      // 실패 시 에러 토스트를 노출하고 현재 화면을 유지한다.
      if (isSaving) return;
      void (async () => {
        setIsSaving(true);
        try {
          // 프리뷰 응답(장소별 duration/stayTime)을 order 기준으로 조인해 명세 필수 필드를 채운다.
          const previewByOrder = new Map(
            (serverPreview?.places ?? []).map((p) => [p.order, p])
          );
          const numericPlaces = finalStops
            .map((s, i) => {
              const order = i + 1;
              const pv = previewByOrder.get(order);
              return {
                placeId: Number(s.id),
                order,
                travelTime: pv?.duration ?? 0,
                stayTime: pv?.stayTime ?? 0,
              };
            })
            .filter((p) => Number.isInteger(p.placeId));
          const created = await planApi.createPlan({
            planTitle: `${(surveyData.mindState ?? '').slice(0, 10)} 힐링 플랜`,
            planDescription: `${surveyData.transport ?? ''}으로 떠나는 나만의 힐링 여행`,
            isPlanVisible: false,
            requiredTime: serverPreview?.requiredTime ?? 0,
            totalDistance: serverPreview?.totalDistance ?? 0,
            ...(startingPoint.address
              ? {
                  departurePoint: {
                    name: startingPoint.address,
                    address: startingPoint.address,
                    x: startingPoint.coord.lng,
                    y: startingPoint.coord.lat,
                  },
                }
              : {}),
            ...(surveyData.startDate
              ? {
                  tripStartDate: `${surveyData.startDate}T${surveyData.startTime || '00:00'}:00`,
                  tripEndDate: `${surveyData.startDate}T${surveyData.endTime || '23:59'}:00`,
                }
              : {}),
            places: numericPlaces,
          });
          reset();
          toast.success('힐링 플랜이 생성되었어요!', {
            description: '내 플랜에서 확인해보세요.',
          });
          router.push(`/course/${created.planId}`);
        } catch (err) {
          console.error('플랜 생성 실패:', err);
          toast.error('플랜 저장에 실패했어요.', {
            description: '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
          });
        } finally {
          setIsSaving(false);
        }
      })();
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
    const selected = recommendedPlaces.filter((p) => selectedPlaceIds.includes(p.id));
    const stayTotal = selected.reduce((sum, p) => sum + parseStayMinutes(p.time), 0);
    const travelTotal = Math.max(0, selected.length - 1) * 15;
    return stayTotal + travelTotal;
  }, [selectedPlaceIds, recommendedPlaces]);

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

          {/* 일출 모션: 수평선 위로 떠오르는 해 */}
          <div className="relative w-40 h-24 mb-8 overflow-hidden" aria-hidden>
            <motion.div
              initial={{ y: 72, scale: 0.85, opacity: 0.6 }}
              animate={{ y: 8, scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 -translate-x-1/2 bottom-0"
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
                className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-300 to-orange-400 shadow-[0_0_40px_12px_rgba(251,191,36,0.35)]"
              />
            </motion.div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-sky-200" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-2xl font-bold mb-4 text-gray-900"
          >
            지금 나에게 필요한
            <br />
            힐링 방법을 알아볼까요?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="text-gray-500 mb-12 leading-relaxed"
          >
            먼저 간단한 설문을 통해
            <br />
            맞춤 여행 플랜을 추천해드릴게요.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            onClick={handleNext}
            className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-200 active:scale-[0.98] transition-transform"
          >
            시작하기
          </motion.button>
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
      <div className="fixed inset-0 z-40 h-dvh flex flex-col bg-white">
        <div className="shrink-0">
          <Header onBack={handleBack} title="나의 상태 확인" showStep />
          <div className="px-5 pt-5 pb-2">
            <h2 className="text-xl font-bold mb-1 text-gray-900">요즘 마음 상태는 어떤가요?</h2>
            <p className="text-sm text-gray-400">
              현재 상태가 없다면 직접 입력할 수 있어요.
            </p>
          </div>
        </div>
        <div className="flex-1 px-5 pt-3 pb-4 overflow-y-auto">
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
                  onFocus={(e) => {
                    setTimeout(
                      () => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                      150
                    );
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
        <div className="shrink-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-gray-100 bg-white">
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
      <div className="fixed inset-0 z-40 h-dvh flex flex-col bg-white">
        <div className="shrink-0">
          <Header onBack={handleBack} title="이동 수단 및 시간" showStep />
          <div className="px-6 pt-5 pb-2">
            <h2 className="text-xl font-bold">
              Q2. 희망하는 이동 수단과
              <br />
              이동 시간을 선택해주세요.
            </h2>
          </div>
        </div>
        <div className="flex-1 px-6 pt-3 pb-4 overflow-y-auto">
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-500 mb-3">이동 수단</h3>
            <div className="flex flex-wrap gap-2">
              {TRANSPORTS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => updateSurvey('transport', label)}
                  className={`flex items-center gap-1.5 px-4 py-3 rounded-lg border font-medium text-sm transition-all ${
                    surveyData.transport === label
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <Icon size={16} />
                  {label}
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
                    <SelectField
                      title="이동 시간 선택"
                      placeholder="시간을 선택해주세요"
                      value={
                        CUSTOM_TIME_OPTIONS.some((o) => o.value === surveyData.transportTime)
                          ? (surveyData.transportTime as string)
                          : ''
                      }
                      options={CUSTOM_TIME_OPTIONS}
                      onChange={(v) => updateSurvey('transportTime', v)}
                      className="bg-white"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="shrink-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-gray-100 bg-white">
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
      <div className="fixed inset-0 z-40 h-dvh flex flex-col bg-white">
        <div className="shrink-0">
          <Header onBack={handleBack} title="일정 선택" showStep />
          <div className="px-6 pt-5 pb-2">
            <h2 className="text-xl font-bold mb-2">
              Q3. 당일치기 여행 일정을
              <br />
              설정해주세요.
            </h2>
            <p className="text-sm text-gray-400">최대 24시간 이내의 당일치기 일정을 선택해주세요.</p>
          </div>
        </div>
        <div className="flex-1 px-6 pt-3 pb-4 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Calendar size={15} className="text-sky-500" />
                여행 시작
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DateField
                  title="여행 시작일 선택"
                  value={surveyData.startDate ?? ''}
                  min={today}
                  onChange={(newStart) => {
                    updateSurvey('startDate', newStart);
                    if (!surveyData.endDate || surveyData.endDate < newStart) {
                      updateSurvey('endDate', newStart);
                    }
                  }}
                />
                <SelectField
                  title="여행 시작 시간 선택"
                  placeholder="시간 선택"
                  value={surveyData.startTime ?? ''}
                  options={HALF_HOURS}
                  onChange={(v) => updateSurvey('startTime', v)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Clock size={15} className="text-orange-500" />
                여행 종료
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DateField
                  title="여행 종료일 선택"
                  value={surveyData.endDate ?? ''}
                  min={surveyData.startDate || today}
                  onChange={(v) => updateSurvey('endDate', v)}
                />
                <SelectField
                  title="여행 종료 시간 선택"
                  placeholder="시간 선택"
                  value={surveyData.endTime ?? ''}
                  options={HALF_HOURS}
                  onChange={(v) => updateSurvey('endTime', v)}
                />
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
        <div className="shrink-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-gray-100 bg-white">
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
    // SDK 로드 실패 시에만 쓰는 정적 폴백 목록
    const fallbackAddresses = customAddress.trim()
      ? MOCK_ADDRESSES.filter((a) => a.label.includes(customAddress.trim()))
      : MOCK_ADDRESSES;

    const selectStartingPoint = (
      type: 'current' | 'custom',
      address: string,
      coord: { lat: number; lng: number }
    ) => {
      setCustomAddress(address);
      setShowAddressList(false);
      setStartingPoint({ type, address, coord });
    };

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
                onSelectCoord={(coord) => {
                  void (async () => {
                    const address = await coordToAddress(coord);
                    selectStartingPoint(
                      'custom',
                      address ?? `지도 선택 위치 (${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)})`,
                      coord
                    );
                  })();
                }}
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
                      const coord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                      // 카카오 역지오코딩으로 실제 주소 라벨을 얻는다 (실패 시 '현재 위치')
                      void (async () => {
                        const address = await coordToAddress(coord);
                        setGeoStatus('success');
                        selectStartingPoint('current', address ?? '현재 위치', coord);
                      })();
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
                  {kakaoError ? (
                    // SDK 로드 실패 시 정적 목록으로 폴백
                    fallbackAddresses.length > 0 ? (
                      fallbackAddresses.map((addr) => (
                        <button
                          key={addr.label}
                          onClick={() => selectStartingPoint('custom', addr.label, addr.coord)}
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
                    )
                  ) : addressResults.length > 0 ? (
                    addressResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() =>
                          selectStartingPoint(
                            'custom',
                            result.address || result.name,
                            result.coord
                          )
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 border-b border-gray-50 last:border-b-0"
                      >
                        <MapPin size={14} className="text-indigo-400 shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm text-gray-700 truncate">{result.name}</span>
                          {result.address && (
                            <span className="block text-xs text-gray-400 truncate">
                              {result.address}
                            </span>
                          )}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      {isSearchingAddress || isKakaoLoading ? '검색 중...' : '검색 결과가 없습니다'}
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
                        onClick={() => selectStartingPoint('custom', addr.label, addr.coord)}
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
            stops={recommendedPlaces.filter((p) => selectedPlaceIds.includes(p.id))}
            showRoute={false}
            className="h-44"
          />
        </div>

        <div className="bg-white p-4 pb-2 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">추천 결과입니다</h2>
          <p className="text-sm text-gray-500">가고 싶은 장소를 선택해주세요.</p>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 pb-32">
          {recommendedPlaces.map((place) => {
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
    const place = recommendedPlaces.find((p) => p.id === viewingPlaceId);
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
    const firstStopCoord = finalStops.length > 0 ? getStopCoord(finalStops[0]) : null;
    return (
      <div className="flex flex-col h-full bg-gray-50 relative">
        <Header onBack={handleBack} title="나만의 힐링 플랜" showStep />

        <div className="bg-white p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg">플랜 일정표</h2>
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
          {serverPreview && (
            <div className="mt-2 flex items-center gap-3 text-xs font-bold text-sky-600 bg-sky-50 px-3 py-2 rounded-lg">
              <span>예상 소요 {formatMinutes(serverPreview.requiredTime)}</span>
              <span className="text-sky-300">|</span>
              <span>총 이동 {serverPreview.totalDistance}km</span>
            </div>
          )}
          {previewFailed && (
            <div className="mt-2 text-[11px] text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
              경로 예상 정보를 불러오지 못했어요. 저장에는 영향이 없어요.
            </div>
          )}
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
                {firstStopCoord && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-indigo-400">
                    <Truck size={10} />
                    <span>
                      {getTravelMinutes(startingPoint.coord, firstStopCoord)}분 소요 예상
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
                  : getStopCoord(finalStops[index - 1]) || startingPoint.coord;
              const currCoord = getStopCoord(stop);
              const nextCoord =
                index < finalStops.length - 1 ? getStopCoord(finalStops[index + 1]) : null;
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
