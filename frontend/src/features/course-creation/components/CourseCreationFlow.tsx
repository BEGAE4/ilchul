'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/shared/ui/SafeImage';
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
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { LogoLoader } from '@/shared/ui/LogoLoader';
import { StepIndicator } from '@/shared/ui/StepIndicator';
import { RouteMap, getStopCoord } from './RouteMap';
import { SelectField, TimeField, DateField } from './SurveyPickers';
import { useSurveyStore, type SurveyStep } from '@/shared/lib/stores/useSurveyStore';
import { planApi, type PlanPreviewResponse } from '@/features/plan';
import { recommendPlaces } from '@/features/place/api/place.api';
import {
  useKakaoMapLoader,
  coordToAddress,
  searchPlacesByKeyword,
  type KeywordPlaceResult,
} from '@/shared/lib/kakao';
import type { Place } from '@/shared/types';
import { mapRecommendedPlaces } from '../utils/recommendedPlaces';
import { toServerDateTime } from '@/shared/lib/format/serverDateTime';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import { fetchMyPageProfile } from '@/features/my-page/api/my-page.api';

// 추천 장소 이미지는 출처(카카오 CDN 등)를 미리 알 수 없어 next.config의 remotePatterns로 감쌀 수 없다.
// 미등록 호스트는 next/image가 렌더 중에 예외를 던지므로 최적화를 끄고, 빈 src·로드 실패는 자리 표시로 대체한다.
const PlaceHeroImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
        <MapPin size={40} className="text-primary-300" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      unoptimized
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
};

// 스텝마다 하단 CTA 클래스를 따로 적다 보니 그림자·비활성 색이 제각각이 됐다.
// 화면이 바뀌어도 같은 버튼으로 읽히도록 한 곳에서 관리한다.
const PRIMARY_CTA =
  'w-full bg-primary-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-200 disabled:bg-gray-300 disabled:shadow-none active:scale-[0.98] transition-all';

// 하단 액션 바. 스크롤 컨테이너는 PageLayout의 .container라서 Header의 sticky top-0과 짝을 이루도록
// sticky bottom-0으로 붙인다. 내용이 길어져도 CTA가 화면 밖으로 밀려나지 않는다.
const STICKY_FOOTER_SHELL =
  'sticky bottom-0 z-30 bg-white border-t border-gray-100 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)]';
const STICKY_FOOTER = `${STICKY_FOOTER_SHELL} p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]`;

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

const HALF_HOUR_LABELS = new Map(HALF_HOURS.map((o) => [o.value, o.label]));

// ── Survey 3: 당일치기 기준 ──
// '자고 오지 않는 일정'이 당일치기의 통념이므로, 다음 날 새벽 귀가까지만 허용한다.
// (야경·일출 코스를 살리면서 1박 2일과는 구분되는 선)
const OVERNIGHT_END_LIMIT = '06:00';
const MAX_TRIP_MINUTES = 20 * 60;

// ── Survey 3: 자주 고르는 시간대 프리셋 ──
// 야간의 종료를 24:00이 아닌 23:30으로 두는 이유 — HALF_HOURS의 마지막 값이 23:30이라
// '직접 설정'으로 펼쳤을 때 프리셋 값이 그대로 매핑되어야 빈칸으로 보이지 않는다.
const TIME_PRESETS: { key: string; label: string; range: string; start: string; end: string }[] = [
  { key: 'morning', label: '오전 반나절', range: '09:00 - 13:00', start: '09:00', end: '13:00' },
  { key: 'afternoon', label: '오후', range: '13:00 - 18:00', start: '13:00', end: '18:00' },
  { key: 'allday', label: '하루 종일', range: '09:00 - 21:00', start: '09:00', end: '21:00' },
  { key: 'night', label: '야간', range: '18:00 - 23:30', start: '18:00', end: '23:30' },
];

function toTimeString(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return toDateString(new Date(y, m - 1, d + days));
}

function diffDays(fromDateStr: string, toDateStr: string): number {
  const [fy, fm, fd] = fromDateStr.split('-').map(Number);
  const [ty, tm, td] = toDateStr.split('-').map(Number);
  const from = new Date(fy, fm - 1, fd).getTime();
  const to = new Date(ty, tm - 1, td).getTime();
  return Math.round((to - from) / 86_400_000);
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getWeekday(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${m}/${d}`;
}

// 오늘/내일/토요일/일요일을 렌더 시점 기준으로 계산한다.
// 당일치기는 하루만 고르므로 '주말' 같은 이틀짜리 표현 대신 요일을 명시하고 날짜를 함께 보여준다.
// 요일 칩이 오늘·내일과 겹치면 중복 활성되므로 제외한다.
function getDatePresets(todayStr: string): { key: string; label: string; date: string }[] {
  const dow = getWeekday(todayStr);
  const presets = [
    { key: 'today', label: '오늘', date: todayStr },
    { key: 'tomorrow', label: '내일', date: addDays(todayStr, 1) },
    { key: 'saturday', label: '토요일', date: addDays(todayStr, (6 - dow + 7) % 7) },
    { key: 'sunday', label: '일요일', date: addDays(todayStr, (7 - dow) % 7) },
  ];
  return presets.filter((p, i) => presets.findIndex((o) => o.date === p.date) === i);
}

function formatTimeLabel(value: string): string {
  return HALF_HOUR_LABELS.get(value) ?? value;
}

// 설문의 마음 상태 → 제목에 넣을 짧은 수식어. MIND_STATES 의 label 과 1:1 로 맞춘다.
const MIND_STATE_ADJECTIVE: Record<string, string> = {
  '그냥 기운이 없고 지쳤어요': '지친',
  '마음이 좀 울적하고 속상해요': '울적한',
  '답답하고 짜증이 많아졌어요': '답답한',
  '무기력하고 재미가 없어요': '무기력한',
  '기분이 좋아요, 뭔가 하고 싶어요': '설레는',
  '생각이 많아졌어요, 정리가 필요해요': '생각 많은',
  '아무 감정도 없이 멍한 느낌이에요': '멍한',
};

const PLAN_TITLE_MAX = 30;

// 기본 제목: "{수식어} {닉네임}님을 위한 힐링 플랜" (예: "울적한 연주님을 위한 힐링 플랜")
// 이전에는 감정 문장 앞 10글자를 그대로 잘라 붙여("생각이 많아졌어요, 힐링 플랜") 어색했다.
// 입력 maxLength(30)를 넘으면 닉네임 → 수식어 순으로 줄인다.
function buildDefaultPlanTitle(mindState: string | undefined, nickname?: string): string {
  const adjective = MIND_STATE_ADJECTIVE[(mindState ?? '').trim()] ?? '';
  const name = (nickname ?? '').trim();
  const candidates = [
    name && adjective ? `${adjective} ${name}님을 위한 힐링 플랜` : '',
    name ? `${name}님을 위한 힐링 플랜` : '',
    adjective ? `${adjective} 당신을 위한 힐링 플랜` : '',
    '나를 위한 힐링 플랜',
  ].filter(Boolean);
  return candidates.find((t) => t.length <= PLAN_TITLE_MAX) ?? '나를 위한 힐링 플랜';
}

function formatDayLabel(dateStr: string, todayStr: string): string {
  if (dateStr === todayStr) return '오늘';
  if (dateStr === addDays(todayStr, 1)) return '내일';
  const [, m, d] = dateStr.split('-').map(Number);
  return `${m}월 ${d}일 (${WEEKDAY_LABELS[getWeekday(dateStr)]})`;
}

// 스텝 번호 매핑 (StepIndicator 용)
// 인디케이터가 실제로 보이는 화면(Header showStep)은 6개뿐이다.
// generating/placeDetail은 인디케이터를 띄우지 않는 경유 화면이라 직전 단계 번호를 그대로 물려받아
// 되돌아왔을 때 진행바가 튀지 않게 한다.
const STEP_NUMBERS: Record<SurveyStep, number> = {
  landing: 0,
  survey1: 1,
  survey2: 2,
  survey3: 3,
  startPoint: 4,
  generating: 4,
  placeSelect: 5,
  placeDetail: 5,
  finalPlan: 6,
};
const TOTAL_STEPS = 6;

// ── 헬퍼 함수 ──
function getTodayStr(): string {
  return toDateString(new Date());
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
    recommendedPlaces,
    selectedPlaceIds,
    finalStops,
    viewingPlaceId,
    isRecalculating,
    startingPoint,
    setStep,
    setPreviousStep,
    updateSurvey,
    setRecommendedPlaces,
    togglePlaceSelection,
    clearPlaceSelection,
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
  // Survey 3 — 프리셋으로 못 고르는 일정을 잡을 때만 펼치는 기존 4필드 UI
  const [showCustomSchedule, setShowCustomSchedule] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // 저장 직전에 사용자가 직접 정하는 값 — 이전에는 감정 문구에서 자동 생성되고 비공개로 고정돼 있었다
  const [planTitle, setPlanTitle] = useState('');
  // 기본 제목에 닉네임을 넣는다. 플랜 생성으로 바로 들어오면 스토어가 비어 있을 수 있어 프로필을 채운다.
  const { user, isLoggedIn, updateProfile } = useUserStore();
  useEffect(() => {
    if (!isLoggedIn || user.name) return;
    let isMounted = true;
    fetchMyPageProfile()
      .then((data) => {
        if (!isMounted) return;
        updateProfile({ name: data.userNickname, avatar: data.userImg, title: data.userIntro, bio: data.userIntro });
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, user.name, updateProfile]);
  const [isPlanVisible, setIsPlanVisible] = useState(false);
  // 최종 플랜 단계의 서버 계산 프리뷰 (소요시간/이동거리)
  const [serverPreview, setServerPreview] = useState<PlanPreviewResponse | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  // 추천 API 실패/빈 응답 시 안내 문구 — 목록 대신 재시도 UI를 보여준다
  const [recommendError, setRecommendError] = useState<string | null>(null);
  // 카카오맵 SDK 로드 상태 — 출발지 검색/역지오코딩에 services 라이브러리 사용
  const [isKakaoLoading, kakaoError] = useKakaoMapLoader();
  // 출발지 키워드 검색 결과 (카카오 로컬 Places.keywordSearch)
  const [addressResults, setAddressResults] = useState<KeywordPlaceResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // 새로고침/재진입 시 sessionStorage 에 저장해둔 설문 입력·추천 결과·선택 장소를 복원한다.
  // 스토어가 skipHydration 이라 마운트 후 여기서 한 번만 수동 복원한다.
  // 최종 플랜 단계로 복원되면 서버 프리뷰(소요시간/거리)는 저장하지 않았으므로 다시 요청한다.
  useEffect(() => {
    void Promise.resolve(useSurveyStore.persist.rehydrate()).then(() => {
      const s = useSurveyStore.getState();
      if (s.step === 'finalPlan' && s.finalStops.length > 0) {
        void requestPreview(s.finalStops);
      }
    });
    // requestPreview 는 렌더마다 새로 만들어지지만 복원은 마운트 시 한 번만 해야 한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // 설문 조건 그대로 장소 추천을 (재)요청한다. 출발지 단계의 '다음으로'와 결과 화면의 '다시 추천받기'가 공유한다.
  const runRecommendation = () => {
    clearPlaceSelection();
    setStep('generating');
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1500));
    void (async () => {
      try {
        const [result] = await Promise.all([
          recommendPlaces({
            emotion: surveyData.mindState ?? '',
            // 서버는 'YYYY-MM-DD HH:mm' 형식을 기대한다 (예: 2026-08-22 10:00)
            startTime: toServerDateTime(surveyData.startDate ?? '', surveyData.startTime ?? ''),
            endTime: toServerDateTime(surveyData.endDate ?? '', surveyData.endTime ?? ''),
            transport: surveyData.transport ?? '',
            transportTime: surveyData.transportTime ?? '',
            location: { x: startingPoint.coord.lng, y: startingPoint.coord.lat },
          }),
          minDelay,
        ]);
        const mapped = mapRecommendedPlaces(result);
        if (mapped.length > 0) {
          setRecommendedPlaces(mapped);
          setRecommendError(null);
        } else {
          // 비어 있다는 것은 응답 모양이 또 달라졌다는 뜻이다. 원본을 남겨 다음 조정의 근거로 삼는다.
          console.warn('추천 응답을 장소 목록으로 변환하지 못했습니다:', result);
          setRecommendedPlaces([]);
          setRecommendError('조건에 맞는 장소를 찾지 못했어요.');
        }
      } catch (err) {
        console.error('장소 추천 실패:', err);
        setRecommendedPlaces([]);
        setRecommendError('추천 장소를 불러오지 못했어요.');
        await minDelay;
      } finally {
        setStep('placeSelect');
      }
    })();
  };

  // 출발지/일정은 프리뷰와 생성 요청이 똑같이 쓴다. 두 곳에서 따로 조립하다 어긋나지 않도록 한 곳에서 만든다.
  const buildPlanContext = () => ({
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
          // 서버는 'yyyy-MM-dd HH:mm' 만 받는다 (ISO 'T' 구분자·초 포함 시 400)
          tripStartDate: toServerDateTime(surveyData.startDate, surveyData.startTime || '00:00'),
          tripEndDate: toServerDateTime(
            surveyData.endDate || surveyData.startDate,
            surveyData.endTime || '23:59'
          ),
        }
      : {}),
  });

  const planDescription = `${surveyData.transport ?? ''}으로 떠나는 나만의 힐링 여행`;

  // 프리뷰는 선택이 아니라 생성의 선행 조건이다.
  // requiredTime/totalDistance/travelTime/stayTime은 전부 서버 계산값이고 명세에 재계산 API가 없어,
  // 실패한 채로 저장하면 0분·0km짜리 플랜이 복구 경로 없이 영구히 남는다.
  const requestPreview = async (stops: Place[]) => {
    setServerPreview(null);
    setPreviewFailed(false);
    setIsPreviewLoading(true);
    try {
      const numericPlaces = stops
        .map((p, i) => ({ placeId: Number(p.id), order: i + 1 }))
        .filter((p) => Number.isInteger(p.placeId));
      if (numericPlaces.length === 0) {
        setPreviewFailed(true);
        return;
      }
      const preview = await planApi.createPlanPreview({
        planTitle: planTitle.trim() || buildDefaultPlanTitle(surveyData.mindState, user.name),
        planDescription,
        isPlanVisible,
        ...buildPlanContext(),
        places: numericPlaces,
      });
      setServerPreview(preview);
    } catch (err) {
      console.error('플랜 생성 프리뷰 실패:', err);
      setPreviewFailed(true);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const savePlan = async () => {
    // 프리뷰 없이 저장하면 0값이 그대로 들어간다. CTA도 막아두지만 마지막 방어선을 둔다.
    if (!serverPreview) {
      toast.error('경로 계산이 끝난 뒤 저장할 수 있어요.');
      return;
    }
    setIsSaving(true);
    try {
      // 프리뷰 응답(장소별 duration/stayTime)을 order 기준으로 조인해 명세 필수 필드를 채운다.
      const previewByOrder = new Map(serverPreview.places.map((p) => [p.order, p]));
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
        planTitle: planTitle.trim() || buildDefaultPlanTitle(surveyData.mindState, user.name),
        planDescription,
        isPlanVisible,
        requiredTime: serverPreview.requiredTime,
        totalDistance: serverPreview.totalDistance,
        ...buildPlanContext(),
        places: numericPlaces,
      });
      reset();
      toast.success('힐링 플랜이 생성되었어요!', { description: '내 플랜에서 확인해보세요.' });
      // 내가 만든 플랜은 소유자 페이지(수정·인증 가능, 스크랩 없음)로 보낸다
      router.push(`/my-course/${created.planId}`);
    } catch (err) {
      console.error('플랜 생성 실패:', err);
      toast.error('플랜 저장에 실패했어요.', {
        description: '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── 네비게이션 ──
  const handleNext = () => {
    if (step === 'landing') setStep('survey1');
    else if (step === 'survey1') setStep('survey2');
    else if (step === 'survey2') setStep('survey3');
    else if (step === 'survey3') setStep('startPoint');
    else if (step === 'startPoint') runRecommendation();
    else if (step === 'placeSelect') {
      const selected = recommendedPlaces.filter((p) => selectedPlaceIds.includes(p.id));
      setFinalStops(selected);
      // 사용자가 아직 제목을 손대지 않았다면 기본값을 채워 편집 출발점으로 삼는다
      if (!planTitle.trim()) setPlanTitle(buildDefaultPlanTitle(surveyData.mindState, user.name));
      setStep('finalPlan');
      void requestPreview(selected);
    } else if (step === 'finalPlan') {
      // v5: POST /api/plan/create 한 번으로 출발지/일정/장소까지 일괄 등록.
      if (isSaving) return;
      void savePlan();
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
    // 설문을 처음부터 다시 하므로 이전 감정에서 만들어진 플랜 이름도 함께 비운다
    setPlanTitle('');
    setIsPlanVisible(false);
    setRecommendError(null);
    setRecommendedPlaces([]);
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
    setFinalStops(newStops);
    // 순서가 바뀌면 이동시간·총소요·총거리가 전부 달라진다. 저장 요청에 실리는 travelTime/stayTime이
    // order에 묶여 있어, 800ms 타이머로 재계산하는 시늉만 하던 것을 실제 프리뷰 재요청으로 바꾼다.
    setIsRecalculating(true);
    void requestPreview(newStops).finally(() => setIsRecalculating(false));
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
    // 오늘을 골랐다면 이미 지난 시각으로 출발하는 일정은 막는다
    if (startDate === today && start.getTime() < Date.now())
      return { valid: false, error: '시작 시간이 이미 지났어요. 다른 시간대를 선택해주세요.' };
    // 당일치기 기준 — 자고 오지 않는 일정. 다음 날 새벽 귀가까지만 허용한다.
    const overnight = diffDays(startDate, endDate);
    if (overnight > 1)
      return { valid: false, error: '당일치기라 다음 날 새벽까지만 선택할 수 있어요.' };
    if (overnight === 1 && endTime > OVERNIGHT_END_LIMIT)
      return {
        valid: false,
        error: `다음 날은 새벽 ${Number(OVERNIGHT_END_LIMIT.slice(0, 2))}시까지만 선택할 수 있어요.`,
      };
    const diffMin = (end.getTime() - start.getTime()) / (1000 * 60);
    if (diffMin <= 0) return { valid: false, error: '종료 시간은 시작 시간 이후여야 해요.' };
    if (diffMin > MAX_TRIP_MINUTES)
      return {
        valid: false,
        error: `한 번에 최대 ${MAX_TRIP_MINUTES / 60}시간까지 계획할 수 있어요.`,
      };
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
    <div className="fixed inset-y-0 app-frame bg-black/50 z-50 flex items-center justify-center p-4">
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
            className="flex-1 py-3 bg-primary-500 font-bold rounded-xl text-sm text-white"
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 'landing') {
    return (
      <div className="flex flex-col min-h-dvh bg-white">
        <Header onBack={handleBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-primary-50 to-white -z-10" />

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
                className="w-16 h-16 rounded-full bg-gradient-to-b from-accent-300 to-accent-500 shadow-[0_0_36px_10px_var(--color-accent-200)]"
              />
            </motion.div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-primary-200" />
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
            className={PRIMARY_CTA}
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
      <div className="fixed inset-y-0 app-frame z-40 h-dvh flex flex-col bg-white">
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
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
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
                  className="w-full py-3.5 px-5 rounded-full border-2 border-primary-500 bg-primary-50 text-primary-700 text-center outline-none placeholder:text-primary-300"
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
        <div className={STICKY_FOOTER}>
          <button
            onClick={handleNext}
            disabled={!surveyData.mindState}
            className={PRIMARY_CTA}
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
      <div className="fixed inset-y-0 app-frame z-40 h-dvh flex flex-col bg-white">
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
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
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
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
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
        <div className={STICKY_FOOTER}>
          <button
            onClick={handleNext}
            disabled={
              !surveyData.transport || !surveyData.transportTime || surveyData.transportTime === '직접입력'
            }
            className={PRIMARY_CTA}
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
    const datePresets = getDatePresets(today);
    const activeTimePreset = TIME_PRESETS.find(
      (p) =>
        surveyData.startTime === p.start &&
        surveyData.endTime === p.end &&
        surveyData.startDate === surveyData.endDate
    );
    // 프리셋으로 표현되지 않는 값이 이미 들어있다면(뒤로 갔다 온 경우 등) 직접 설정을 펼쳐둔다
    const hasScheduleValue = !!(surveyData.startTime && surveyData.endTime);
    const isCustomOpen = showCustomSchedule || (hasScheduleValue && !activeTimePreset);

    // 오늘을 고른 경우, 이미 지나간 시간대 프리셋은 고를 수 없게 한다.
    // 'HH:MM' 형식은 제로패딩되어 있어 문자열 비교로 시각 비교가 성립한다.
    const nowHM = toTimeString(new Date());
    const isPastOnDate = (date: string | undefined, time: string) =>
      (date ?? today) === today && time < nowHM;
    const availableTimePresets = TIME_PRESETS.filter(
      (p) => !isPastOnDate(surveyData.startDate, p.start)
    );
    const isTodaySoldOut =
      (surveyData.startDate ?? today) === today && availableTimePresets.length === 0;

    // 날짜만 바꿀 때, 이미 익일 종료로 잡혀 있던 일정은 날짜 간격을 유지한다
    const applyDatePreset = (date: string) => {
      const { startDate: prevStart, endDate: prevEnd, startTime } = surveyData;
      const gap = prevStart && prevEnd ? Math.max(0, diffDays(prevStart, prevEnd)) : 0;
      updateSurvey('startDate', date);
      updateSurvey('endDate', gap > 0 ? addDays(date, gap) : date);
      // 오늘로 옮기면서 기존 시간대가 이미 지나버렸다면 시간 선택만 비운다
      if (startTime && isPastOnDate(date, startTime)) {
        updateSurvey('startTime', '');
        updateSurvey('endTime', '');
      }
    };

    // 종료가 다음 날(새벽)인지 — 당일치기 허용 범위는 startDate 또는 startDate+1까지다
    const isOvernight =
      !!surveyData.startDate &&
      !!surveyData.endDate &&
      diffDays(surveyData.startDate, surveyData.endDate) === 1;

    const setOvernight = (overnight: boolean) => {
      const base = surveyData.startDate || today;
      updateSurvey('startDate', base);
      updateSurvey('endDate', overnight ? addDays(base, 1) : base);
    };

    const applyTimePreset = (preset: (typeof TIME_PRESETS)[number]) => {
      const date = surveyData.startDate || today;
      updateSurvey('startDate', date);
      updateSurvey('startTime', preset.start);
      updateSurvey('endDate', date);
      updateSurvey('endTime', preset.end);
    };

    return (
      <div className="fixed inset-y-0 app-frame z-40 h-dvh flex flex-col bg-white">
        <div className="shrink-0">
          <Header onBack={handleBack} title="일정 선택" showStep />
          <div className="px-6 pt-5 pb-2">
            <h2 className="text-xl font-bold mb-2">Q3. 언제 다녀오실 건가요?</h2>
            <p className="text-sm text-gray-400">하루 안에 다녀오는 코스를 만들어드려요.</p>
          </div>
        </div>
        <div className="flex-1 px-6 pt-3 pb-4 overflow-y-auto">
          <div className="space-y-6">
            {/* 날짜 — 오늘/내일/이번 주말 칩 + 그 외 날짜는 캘린더 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Calendar size={15} className="text-primary-500" />
                날짜
              </div>
              <div className="flex flex-wrap gap-2">
                {datePresets.map((preset) => {
                  const isActive = surveyData.startDate === preset.date;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => applyDatePreset(preset.date)}
                      className={`px-4 py-2.5 rounded-lg border font-medium text-sm transition-all ${
                        isActive
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {preset.label}
                      <span
                        className={`ml-1.5 text-xs ${
                          isActive ? 'text-primary-500' : 'text-gray-400'
                        }`}
                      >
                        {formatShortDate(preset.date)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <DateField
                title="여행 날짜 선택"
                placeholder="다른 날짜 선택"
                value={
                  surveyData.startDate && !datePresets.some((p) => p.date === surveyData.startDate)
                    ? surveyData.startDate
                    : ''
                }
                min={today}
                onChange={applyDatePreset}
              />
            </div>

            {/* 시간대 — 프리셋 한 번으로 시작/종료가 함께 정해진다 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Clock size={15} className="text-accent-500" />
                가장 많이 고르는 일정
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TIME_PRESETS.map((preset) => {
                  const isActive = activeTimePreset?.key === preset.key;
                  const isPast = isPastOnDate(surveyData.startDate, preset.start);
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      disabled={isPast}
                      onClick={() => applyTimePreset(preset)}
                      className={`px-4 py-3 rounded-xl border text-left transition-all ${
                        isPast
                          ? 'border-gray-100 bg-gray-50 text-gray-300'
                          : isActive
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="block font-bold text-sm">{preset.label}</span>
                      <span
                        className={`block text-xs mt-0.5 ${
                          isPast
                            ? 'text-gray-300'
                            : isActive
                              ? 'text-primary-500'
                              : 'text-gray-400'
                        }`}
                      >
                        {isPast ? '시간이 지났어요' : preset.range}
                      </span>
                    </button>
                  );
                })}
              </div>
              {isTodaySoldOut && (
                <div className="flex items-start gap-2 bg-accent-50 p-3 rounded-xl border border-accent-100">
                  <AlertCircle size={16} className="text-accent-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-accent-700">
                    오늘은 남은 시간대가 없어요. 내일 이후로 선택하거나 직접 설정해주세요.
                  </span>
                </div>
              )}
            </div>

            {/* 직접 설정 — 기존 4필드 UI를 그대로 접어둔 영역 */}
            <div>
              <button
                type="button"
                onClick={() => setShowCustomSchedule((prev) => !prev)}
                aria-expanded={isCustomOpen}
                className="w-full flex items-center justify-center gap-1 py-2 text-sm font-medium text-gray-500 active:text-gray-700"
              >
                직접 설정하기
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isCustomOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isCustomOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 border border-gray-100 rounded-xl p-4"
                >
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-gray-700">여행 시작</div>
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
                      <TimeField
                        title="여행 시작 시간 선택"
                        placeholder="시간 선택"
                        value={surveyData.startTime ?? ''}
                        onChange={(v) => updateSurvey('startTime', v)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-bold text-gray-700">여행 종료</div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* 당일치기라 종료일 후보는 당일 또는 다음 날 새벽 둘뿐 — 캘린더 대신 토글 */}
                      <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl">
                        {[
                          { label: '당일', overnight: false },
                          { label: '다음날 새벽', overnight: true },
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setOvernight(opt.overnight)}
                            className={`py-2 px-1 rounded-lg text-xs font-bold transition-colors ${
                              isOvernight === opt.overnight
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-500'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <TimeField
                        title="여행 종료 시간 선택"
                        placeholder="시간 선택"
                        value={surveyData.endTime ?? ''}
                        onChange={(v) => updateSurvey('endTime', v)}
                      />
                    </div>
                    {isOvernight && (
                      <p className="text-xs text-gray-400">
                        자고 오지 않는 일정이라 다음 날 새벽{' '}
                        {Number(OVERNIGHT_END_LIMIT.slice(0, 2))}시까지 선택할 수 있어요.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 선택 결과 요약 */}
            {survey3Validation.valid && surveyData.startDate && surveyData.endDate && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-50 p-4 rounded-xl border border-primary-100"
              >
                <div className="text-primary-700 font-bold">
                  {formatDayLabel(surveyData.startDate, today)}{' '}
                  {formatTimeLabel(surveyData.startTime ?? '')} →{' '}
                  {surveyData.endDate !== surveyData.startDate && '다음날 '}
                  {formatTimeLabel(surveyData.endTime ?? '')}
                </div>
                <div className="flex items-center gap-1.5 text-primary-600 text-sm mt-1">
                  <Timer size={14} />총{' '}
                  {formatMinutes(
                    (new Date(`${surveyData.endDate}T${surveyData.endTime}`).getTime() -
                      new Date(`${surveyData.startDate}T${surveyData.startTime}`).getTime()) /
                      60_000
                  )}
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
        <div className={STICKY_FOOTER}>
          <button
            onClick={handleNext}
            disabled={!survey3Validation.valid}
            className={PRIMARY_CTA}
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
      <div className="flex flex-col min-h-dvh items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-50 via-primary-50 to-white -z-10" />
        <div className="mb-6">
          <LogoLoader />
        </div>
        <div>
          {/* 닉네임은 기본 플랜 제목과 같은 출처(user.name)를 쓴다. 아직 못 받았으면 '당신' (QA C-04) */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {user.name ? `${user.name}님에게` : '당신에게'} 맞는 곳을
            <br />
            찾는 중입니다.
          </h2>
          <p className="text-gray-500 text-sm">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // (6) Starting Point Selection
  // ════════════════════════════════════════════
  if (step === 'startPoint') {
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
      <div className="flex flex-col min-h-dvh bg-white">
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
            <div className="relative rounded-xl overflow-hidden border-2 border-primary-100">
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
                    <MapPin size={16} className="text-primary-500 shrink-0" />
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

          {/* 현재 위치 버튼 + 검색 — 같은 화면의 '다음으로'가 유일한 주 버튼이 되도록 GPS는 톤 다운한 채움을 쓴다 */}
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
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 font-bold active:bg-primary-100 transition-colors"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-base focus:border-primary-400 outline-none transition-all"
                />
              </div>

              {showAddressList && customAddress && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
                >
                  {kakaoError ? (
                    // SDK 로드 실패 시 검색을 쓸 수 없다 — 현재 위치 버튼만 남는다
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      지도 서비스를 불러오지 못해 검색할 수 없어요.
                      <br />
                      현재 위치로 출발지를 설정해주세요.
                    </div>
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
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary-50 border-b border-gray-50 last:border-b-0"
                      >
                        <MapPin size={14} className="text-primary-400 shrink-0" />
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
            </div>
          </div>
        </div>
        <div className={STICKY_FOOTER}>
          <button
            onClick={handleNext}
            disabled={!startingPoint.address}
            className={PRIMARY_CTA}
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
      <div className="flex flex-col min-h-dvh bg-gray-50">
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
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">추천 결과입니다</h2>
              <p className="text-sm text-gray-500">가고 싶은 장소를 선택해주세요.</p>
            </div>
            {/* 설문을 다시 하지 않고 같은 조건으로 추천만 새로 받는다 */}
            <button
              type="button"
              onClick={runRecommendation}
              className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded-full active:bg-gray-200"
            >
              <RotateCcw size={12} />
              다시 추천받기
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {/* 추천 실패/빈 결과 — 목록 대신 안내와 재시도 버튼만 보여준다 */}
          {recommendError && (
            <div className="flex flex-col items-center text-center gap-3 bg-white p-6 rounded-xl border border-accent-100">
              <AlertCircle size={24} className="text-accent-400" />
              <div>
                <p className="text-sm font-bold text-gray-900">{recommendError}</p>
                <p className="text-xs text-gray-500 mt-1">
                  잠시 후 다시 시도하거나 출발지를 바꿔보세요.
                </p>
              </div>
              <button
                type="button"
                onClick={runRecommendation}
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-primary-500 px-4 py-2.5 rounded-xl active:bg-primary-600"
              >
                <RotateCcw size={14} />
                다시 추천받기
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="text-xs font-bold text-gray-500 underline underline-offset-2"
              >
                출발지 바꾸기
              </button>
            </div>
          )}
          {recommendedPlaces.map((place) => {
            const isSelected = selectedPlaceIds.includes(place.id);
            return (
              <div
                key={place.id}
                onClick={() => togglePlaceSelection(place.id)}
                className={`relative bg-white p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary-500 shadow-md ring-1 ring-primary-500'
                    : 'border-gray-100 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                        {place.category}
                      </span>
                      {/* AI 추천 태그 중 첫 번째만 배지로 보여준다 */}
                      {place.tags[0] && (
                        <span className="text-xs text-gray-400">{place.tags[0]}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900">{place.name}</h3>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                </div>
                {(place.description || place.address) && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {place.description || place.address}
                  </p>
                )}
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

        {/* 예상 소요 시간 바 + 버튼 — 안쪽 패딩이 따로 있어 shell만 쓴다 */}
        <div className={STICKY_FOOTER_SHELL}>
          {selectedPlaceIds.length > 0 && availableMin > 0 && (
            <div className="px-4 pt-3 pb-1">
              <div
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm ${
                  timeDiffMin >= 0 ? 'bg-primary-50 text-primary-700' : 'bg-accent-50 text-accent-700'
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
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-accent-100 text-accent-600'
                  }`}
                >
                  {timeDiffMin >= 0
                    ? `${formatMinutes(timeDiffMin)} 여유`
                    : `${formatMinutes(Math.abs(timeDiffMin))} 초과`}
                </span>
              </div>
            </div>
          )}
          <div className="px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button
              onClick={handleNext}
              disabled={selectedPlaceIds.length === 0}
              className={PRIMARY_CTA}
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
      <div className="flex flex-col min-h-dvh bg-white">
        <div className="relative h-64 w-full shrink-0">
          <PlaceHeroImage src={place.image} alt={place.name} />
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
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded mb-2 inline-block">
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

            {/* 추천 응답(SearchPlaceResponseDto)에는 주소·전화·소개가 없다.
                값이 없는 행을 그대로 두면 제목만 있고 내용이 빈 줄로 남으므로 행째 감춘다. */}
            <div className="space-y-4 mb-8">
              {place.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 mt-0.5" size={18} />
                  <div>
                    <div className="text-sm font-bold text-gray-900">주소</div>
                    <div className="text-sm text-gray-500">{place.address}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Clock className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm font-bold text-gray-900">추천 체류 시간</div>
                  <div className="text-sm text-gray-500">{place.time}</div>
                </div>
              </div>
              {place.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-[18px] flex justify-center text-gray-400 font-bold text-xs mt-0.5">
                    Tel
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">전화번호</div>
                    <div className="text-sm text-gray-500">{place.phone}</div>
                  </div>
                </div>
              )}
            </div>

            {place.description && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-2">장소 소개</h2>
                <p className="text-gray-600 leading-relaxed text-sm">{place.description}</p>
              </div>
            )}
          </div>
        </div>

        {previousStep === 'placeSelect' && (
          <div className={STICKY_FOOTER}>
            <button
              onClick={() => {
                togglePlaceSelection(place.id);
                handleBack();
              }}
              className={`w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${
                isSelected
                  ? 'bg-red-50 text-red-500 border border-red-100'
                  : 'bg-primary-500 text-white shadow-lg shadow-primary-200'
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
    // 저장 요청과 같은 기준(order)으로 프리뷰를 조인한다 — 화면 값과 저장 값이 항상 같아진다.
    const previewStopByOrder = new Map((serverPreview?.places ?? []).map((p) => [p.order, p]));
    // 출발지에서 첫 장소까지 걸리는 시간. 프리뷰가 없으면 좌표 기반 추정치로 대체한다.
    const departTravelMin =
      previewStopByOrder.get(1)?.duration ??
      (firstStopCoord ? getTravelMinutes(startingPoint.coord, firstStopCoord) : null);
    return (
      <div className="flex flex-col min-h-dvh bg-gray-50 relative">
        <Header onBack={handleBack} title="나만의 힐링 플랜" showStep />

        <div className="bg-white p-4 border-b border-gray-100">
          {/* 플랜 이름 — 저장 전에 직접 정할 수 있다 */}
          <label htmlFor="plan-title" className="block text-xs font-bold text-gray-500 mb-1">
            플랜 이름
          </label>
          <input
            id="plan-title"
            type="text"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
            placeholder={buildDefaultPlanTitle(surveyData.mindState, user.name)}
            maxLength={30}
            className="w-full mb-3 p-3 border border-gray-200 rounded-xl bg-gray-50 font-bold text-gray-900 outline-none focus:border-primary-400 focus:bg-white transition-colors"
          />

          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg">플랜 일정표</h2>
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
              총 {finalStops.length}개 장소
            </span>
          </div>
          {/* 날짜·이동수단·출발지는 한 줄에 밀어넣으면 주소에서 줄바꿈이 터진다. 항목마다 한 행씩 준다. */}
          <div className="flex flex-col gap-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="shrink-0" />
              <span>{surveyData.startDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck size={14} className="shrink-0" />
              <span>{surveyData.transport} 이동</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Navigation size={14} className="shrink-0" />
              <span className="truncate">{startingPoint.address}</span>
            </div>
          </div>
          {serverPreview && (
            <div className="mt-2 flex items-center gap-3 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
              <span>예상 소요 {formatMinutes(serverPreview.requiredTime)}</span>
              <span className="text-primary-300">|</span>
              <span>총 이동 {serverPreview.totalDistance}km</span>
            </div>
          )}
          {isPreviewLoading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              <Loader2 size={12} className="animate-spin" />
              경로를 계산하고 있어요...
            </div>
          )}
          {/* 프리뷰 값이 곧 저장 값이라, 실패하면 저장을 막고 재시도를 유도한다.
              이전에는 "저장에는 영향이 없어요"라고 안내한 뒤 0분·0km로 저장하고 있었다. */}
          {previewFailed && (
            <div className="mt-2 flex items-start gap-2 bg-accent-50 px-3 py-2 rounded-lg border border-accent-100">
              <AlertCircle size={14} className="text-accent-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-accent-700">
                  경로를 계산하지 못해 지금은 저장할 수 없어요.
                </p>
                <button
                  type="button"
                  onClick={() => void requestPreview(finalStops)}
                  className="mt-1 text-xs font-bold text-accent-700 underline underline-offset-2"
                >
                  다시 계산하기
                </button>
              </div>
            </div>
          )}

          {/* 공개 여부 — 이전에는 비공개로 고정돼 있었다.
              이름을 정하고 일정을 확인한 뒤 마지막에 결정하는 값이라 입력 영역 맨 아래에 둔다. */}
          <button
            type="button"
            role="switch"
            aria-checked={isPlanVisible}
            onClick={() => setIsPlanVisible((prev) => !prev)}
            className="w-full flex items-center justify-between gap-3 mt-4 p-3 rounded-xl border border-gray-200 text-left"
          >
            <span className="min-w-0">
              <span className="block text-sm font-bold text-gray-900">
                {isPlanVisible ? '공개 플랜' : '비공개 플랜'}
              </span>
              <span className="block text-xs text-gray-400 mt-0.5">
                {isPlanVisible
                  ? '다른 사람도 이 플랜을 볼 수 있어요.'
                  : '나만 볼 수 있어요. 나중에 바꿀 수 있어요.'}
              </span>
            </span>
            <span
              className={`shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors ${
                isPlanVisible ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isPlanVisible ? 'translate-x-5' : ''
                }`}
              />
            </span>
          </button>
        </div>

        <div className="px-4 pt-3 pb-1">
          <RouteMap
            startingPoint={startingPoint}
            stops={finalStops}
            showRoute
            className="h-40"
          />
        </div>

        {/* 일정표는 페이지 스크롤(PageLayout .container)에 맡긴다.
            이전에는 flex-1 + overflow-y-auto 로 중첩 스크롤을 만들어, 상단 입력 패널과 지도를 뺀
            한두 항목 높이만 남아 모바일에서 일정을 거의 볼 수 없었다. */}
        <div className="flex-1 p-4 pb-6 relative">
          {isRecalculating && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-primary-500 mb-2" size={32} />
              <p className="text-sm font-bold text-gray-600">최적 경로 재계산 중...</p>
            </div>
          )}

          <div className="space-y-4">
            {/* 출발지 */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <Navigation size={12} className="text-white" />
                </div>
                <div className="w-0.5 flex-1 bg-primary-200 my-1" />
              </div>
              <div className="pb-2 flex-1">
                <div className="text-sm font-bold text-primary-600">출발지</div>
                <div className="text-xs text-gray-500">
                  {startingPoint.address} · {surveyData.startTime} 출발
                </div>
                {departTravelMin !== null && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-primary-400">
                    <Truck size={10} />
                    <span>{departTravelMin}분 소요 예상</span>
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
              // 화면에 보이는 값과 저장되는 값이 어긋나지 않도록 서버 프리뷰를 우선 쓰고,
              // 프리뷰가 아직 없을 때만 좌표 기반 추정치로 대체한다.
              const pv = previewStopByOrder.get(index + 1);
              const pvNext = previewStopByOrder.get(index + 2);
              const travelFromPrev =
                pv?.duration ?? (currCoord ? getTravelMinutes(prevCoord, currCoord) : 15);
              const travelToNext =
                index < finalStops.length - 1
                  ? (pvNext?.duration ??
                    (nextCoord && currCoord ? getTravelMinutes(currCoord, nextCoord) : null))
                  : null;
              const stayLabel = pv?.stayTime ? formatMinutes(pv.stayTime) : stop.time;

              return (
                <div
                  key={stop.id}
                  className="flex gap-3 group cursor-pointer"
                  onClick={() => openPlaceDetail(stop.id)}
                >
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold z-10 shadow-sm">
                      {index + 1}
                    </div>
                    {index < finalStops.length - 1 && (
                      <div className="w-0.5 flex-1 bg-primary-200 my-1" />
                    )}
                  </div>

                  <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-xs text-primary-600 font-bold mb-0.5">
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
                          className="p-1 text-gray-400 hover:text-primary-500 disabled:opacity-30"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => moveStop(index, 'down')}
                          disabled={index === finalStops.length - 1}
                          className="p-1 text-gray-400 hover:text-primary-500 disabled:opacity-30"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>추천 체류 {stayLabel}</span>
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

        <div className={STICKY_FOOTER}>
          <button
            onClick={handleNext}
            disabled={!serverPreview || isSaving || isPreviewLoading}
            className={`${PRIMARY_CTA} flex items-center justify-center gap-2`}
          >
            {isSaving || isPreviewLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Check size={20} />
            )}
            {isSaving
              ? '플랜 저장 중...'
              : isPreviewLoading
                ? '경로 계산 중...'
                : '힐링 플랜 생성 완료'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};
