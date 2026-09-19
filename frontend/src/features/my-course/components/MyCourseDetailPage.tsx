'use client';

import { photoUploadErrorMessage } from '@/shared/lib/image';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from '@/shared/ui/SafeImage';
import CoverImage from '@/shared/ui/CoverImage';
import {
  ArrowLeft,
  Calendar,
  Camera,
  MapPin,
  Share2,
  MoreVertical,
  BadgeCheck,
  ImagePlus,
  X,
  Pencil,
  ArrowUpDown,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Timer,
  Info,
  Images,
  Heart,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  usePlanDetail,
  usePlanActions,
  planApi,
  pickPlanCover,
  type PlanPlaceDetail,
  type PlanPreviewResponse,
} from '@/features/plan';
import { ShareBottomSheet } from '@/shared/ui/ShareBottomSheet';
import { toServerDateTime, parseServerDate } from '@/shared/lib/format/serverDateTime';
import { HALF_HOURS, timeToMin, addMinutesToTime, todayLocalDate } from '@/features/plan/utils/schedule';
import { getTripPhase, type TripPhase } from '@/features/plan/utils/tripPhase';
import { ReviewPhoto } from './ReviewPhoto';
import { STAMP_COPY } from '../constants/stampCopy';
import {
  distanceMeters,
  isStampCanceled,
  outOfRangeTitle,
  stampErrorKind,
  STAMP_RADIUS_M,
} from '../utils/stampFeedback';
import { placeApi } from '@/features/place';
import { useBackToPlanListAfterCreate } from '../hooks/useBackToPlanListAfterCreate';

function formatMinutes(min: number): string {
  const h = Math.floor(Math.abs(min) / 60);
  const m = Math.abs(min) % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}
function formatCreatedAt(iso?: string): string {
  if (!iso) return '방금 전';
  const d = parseServerDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
// 'yyyy-MM-dd HH:mm' / ISO('yyyy-MM-ddTHH:mm:ss') 모두 앞 10자·11~16자가 동일해 slice로 처리
function isoDate(iso?: string): string {
  return iso ? iso.slice(0, 10) : '';
}
function isoTime(iso?: string): string {
  return iso && iso.length >= 16 ? iso.slice(11, 16) : '';
}

const PHASE_LABEL: Record<TripPhase, string> = {
  unscheduled: '일정 미정',
  before: '여행 전',
  during: '여행 중',
  after: '여행 완료',
};

// 현재 위치 조회 (실패/거부/미지원 시 null — 서버가 좌표 없는 인증을 500 으로 거절하므로 호출부가 전송을 막는다)
// 스탬프는 서버가 150m 반경으로 판정한다. enableHighAccuracy 를 켜지 않으면 브라우저가 GNSS 대신
// Wi-Fi·기지국 기반의 성긴 좌표를 돌려줄 수 있고, 그러면 장소에 서 있어도 422 가 난다.
// GNSS 는 콜드스타트에 몇 초가 걸리므로 타임아웃도 함께 늘린다 (기존 5초로는 자주 시간 초과).
const STAMP_GEO_TIMEOUT_MS = 12000;

// 브라우저의 timeout 옵션은 **권한을 허용한 뒤부터** 센다. 권한 창이 떠 있는 채로 남거나, 카메라에서 돌아온 직후
// 요청이 콜백 없이 끝나는 경우(iOS)에는 성공·실패 어느 쪽도 오지 않아 '기록하는 중'이 영원히 이어졌다.
// 그래서 자체 감시 타이머를 둔다 — 브라우저 제한 시간보다 조금 길게.
const STAMP_GEO_WATCHDOG_MS = STAMP_GEO_TIMEOUT_MS + 3000;

function getCurrentLocation(): Promise<{ x: number; y: number; accuracy: number } | null> {
  return new Promise((resolvePromise) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolvePromise(null);
      return;
    }
    let settled = false;
    const resolve = (value: { x: number; y: number; accuracy: number } | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      resolvePromise(value);
    };
    const watchdog = setTimeout(() => resolve(null), STAMP_GEO_WATCHDOG_MS);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          x: pos.coords.longitude,
          y: pos.coords.latitude,
          accuracy: pos.coords.accuracy,
        }),
      () => resolve(null),
      // maximumAge 0 — 지금 어디에 있는지가 중요하므로 캐시된 좌표를 쓰지 않는다
      { enableHighAccuracy: true, timeout: STAMP_GEO_TIMEOUT_MS, maximumAge: 0 }
    );
  });
}

interface MyCourseDetailPageProps {
  courseId: string;
}

export function MyCourseDetailPage({ courseId }: MyCourseDetailPageProps) {
  const router = useRouter();
  // 플랜을 방금 만들고 들어왔으면 뒤로가기를 마이페이지 플랜 목록으로 보낸다
  useBackToPlanListAfterCreate(String(courseId));

  // 플랜 상세는 서버에서만 조회한다. 실패 시 에러 UI를 렌더링한다.
  const { plan, isLoading, error: planError, errorKind: planErrorKind, refetch } = usePlanDetail(courseId);
  // 내 플랜에서도 좋아요는 가능하다 (스크랩은 소유자에게 의미가 없어 제공하지 않는다)
  const { isLiked, likeCount, toggleLike } = usePlanActions(plan);

  const reviewRef = useRef<HTMLDivElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  // capture 없는 입력 — 앨범 선택용. capture 는 브라우저 힌트라 한 입력으로 두 동선을 낼 수 없다.
  const stampGalleryInputRef = useRef<HTMLInputElement>(null);
  const reviewPhotoInputRef = useRef<HTMLInputElement>(null);
  const planImageInputRef = useRef<HTMLInputElement>(null);

  // 여행 기록 — 전용 API 는 없지만 명세의 두 엔드포인트로 저장한다.
  //   텍스트: PATCH /api/plan/{planId} (planDescription)  /  사진: POST /api/plan/{planId}/images
  // 이전에는 화면 상태에만 넣고 '저장되었어요' 토스트를 띄워 새로고침하면 사라졌다.
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewText, setReviewText] = useState('');
  // 아직 업로드하지 않은 사진 — 저장 시 업로드. 미리보기는 object URL.
  const [pendingPhotos, setPendingPhotos] = useState<{ file: File; url: string }[]>([]);
  const [isSavingReview, setIsSavingReview] = useState(false);

  const [verifyingStopId, setVerifyingStopId] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  // 기록 중 어느 단계에서 기다리는지 — 위치 확인(최대 15초) → 사진 업로드(최대 45초)
  const [verifyStep, setVerifyStep] = useState<'locating' | 'uploading'>('locating');
  // '취소'를 누르면 진행 중인 기록을 끊는다. 위치 조회는 끊을 수 없어 결과를 버린다
  const stampAbortRef = useRef<AbortController | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);

  // 순서 편집 — 로컬로 순서를 바꾼 뒤 완료 시 프리뷰 → 확정(update) 순으로 저장
  const [orderedPlaces, setOrderedPlaces] = useState<PlanPlaceDetail[] | null>(null);
  const [reorderPreview, setReorderPreview] = useState<PlanPreviewResponse | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [cloneDate, setCloneDate] = useState('');
  const [cloneStartTime, setCloneStartTime] = useState('');
  const [cloneEndTime, setCloneEndTime] = useState('');
  const [isCloning, setIsCloning] = useState(false);

  // 여행 일정(날짜·시작·종료) 수정 — 담기·복제한 플랜은 서버가 일정을 비워 둔다.
  // 마감 전이고 기록이 없을 때만 연다. 마감된 여행은 복제해서 새 일정으로 시작한다.
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // 플랜 사진 관리
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white min-h-dvh">
        <div className="h-60 w-full bg-gray-200 animate-pulse" />
        <div className="p-5 space-y-3">
          <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
          <div className="h-24 w-full bg-gray-100 animate-pulse rounded-xl" />
          <div className="h-24 w-full bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  // 에러 UI — 데이터 로드 실패 또는 존재하지 않는 플랜
  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <X size={28} className="text-gray-400" />
        </div>
        <p className="text-gray-900 font-bold mb-1">
          {planError ?? '플랜 정보를 불러오지 못했어요.'}
        </p>
        {planErrorKind !== 'not_found' && (
          <p className="text-sm text-gray-500 mb-6">잠시 후 다시 시도해주세요.</p>
        )}
        <div className={`flex gap-2 w-full max-w-xs ${planErrorKind === 'not_found' ? 'mt-6' : ''}`}>
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm"
          >
            돌아가기
          </button>
          {planErrorKind !== 'not_found' && (
            <button
              onClick={refetch}
              className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-xl text-sm shadow-md shadow-primary-200"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    );
  }

  const serverPlaces = [...plan.planPlaceDetailDtos].sort((a, b) => a.orderIndex - b.orderIndex);
  const stops = orderedPlaces ?? serverPlaces;
  const isReorderMode = orderedPlaces !== null;

  // 대표 이미지 — 목록 카드와 같은 규칙(pickPlanCover). 없으면 CoverImage 의 기본 커버
  const thumbnail = pickPlanCover(plan);
  const locationLabel = serverPlaces[0]?.address?.split(' ').slice(0, 2).join(' ') || '미정';
  const scheduledDate = isoDate(plan.tripStartDate);
  const startTime = isoTime(plan.tripStartDate);
  const endTime = isoTime(plan.tripEndDate);

  const phase = getTripPhase(plan.tripStartDate, plan.tripEndDate);
  const canEdit = phase !== 'after';
  // 기억 스탬프는 현장에서만 남기므로 여행 날(시작일 00:00 ~ 마감)에만 연다. 날짜를 옮겨 기록하게 하지 않는다.
  const canVerify = phase === 'during';
  const allVerified = stops.length > 0 && stops.every((s) => s.isStamped);

  const estimatedTotalMin = plan.requiredTime;
  const availableMin = startTime && endTime ? timeToMin(endTime) - timeToMin(startTime) : 0;

  const completedStops = stops.filter((s) => s.isStamped).length;
  const progress = stops.length > 0 ? (completedStops / stops.length) * 100 : 0;
  // 일정 변경은 마감 전까지. 기록을 남긴 여행은 그 날짜의 현장 기록이라 일정을 옮기지 않는다.
  const canEditSchedule = canEdit && completedStops === 0;
  // 장소 카드 비활성 문구용 'M/D'
  const tripDayLabel = scheduledDate
    ? `${Number(scheduledDate.slice(5, 7))}/${Number(scheduledDate.slice(8, 10))}`
    : '';

  const MAX_REVIEW_PHOTOS = 6;
  const savedPhotos = plan?.planImageUrls ?? [];

  const startEditingReview = () => {
    setReviewText(plan?.planDescription ?? '');
    setIsEditingReview(true);
  };

  const discardPendingPhotos = () => {
    pendingPhotos.forEach((p) => URL.revokeObjectURL(p.url));
    setPendingPhotos([]);
  };

  const handleCancelReview = () => {
    discardPendingPhotos();
    setIsEditingReview(false);
  };

  // 사진은 한 장씩 올라간다(앞단 1MB 제한이 요청 전체에 걸려서). 중간에 실패하면 올라간 만큼은 화면에 반영하고,
  // 용량 문제인지 네트워크 문제인지 구분해 알린다 — 이전에는 전부 "다시 시도해주세요"라 같은 사진으로 계속 실패했다.
  const reportPhotoUploadFailure = (err: unknown, fallback: string) => {
    const partial = err instanceof planApi.PlanImageUploadError ? err : null;
    const reason = photoUploadErrorMessage(partial ? partial.cause : err, fallback);
    if (partial && partial.uploaded > 0) {
      toast.warning(`${partial.total}장 중 ${partial.uploaded}장만 올렸어요.`, { description: reason });
      refetch();
      return;
    }
    toast.error(reason);
  };

  const handleSaveReview = async () => {
    if (!plan || isSavingReview) return;
    const text = reviewText.trim();
    const textChanged = text !== (plan.planDescription ?? '');
    if (!textChanged && pendingPhotos.length === 0) {
      setIsEditingReview(false);
      return;
    }
    setIsSavingReview(true);
    try {
      if (textChanged) {
        await planApi.updatePlan(plan.planId, { planDescription: text });
      }
      if (pendingPhotos.length > 0) {
        await planApi.uploadPlanImages(
          plan.planId,
          pendingPhotos.map((p) => p.file)
        );
      }
      discardPendingPhotos();
      setIsEditingReview(false);
      toast.success('여행 기록이 저장되었어요!');
      refetch();
    } catch (err) {
      console.error('여행 기록 저장 실패:', err);
      reportPhotoUploadFailure(err, '여행 기록 저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleAddReviewPhoto = (files: FileList | null) => {
    if (!files) return;
    const remain = MAX_REVIEW_PHOTOS - savedPhotos.length - pendingPhotos.length;
    const next = Array.from(files)
      .slice(0, Math.max(0, remain))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    if (next.length) setPendingPhotos((prev) => [...prev, ...next]);
    if (reviewPhotoInputRef.current) reviewPhotoInputRef.current.value = '';
  };

  const handleRemovePendingPhoto = (index: number) => {
    setPendingPhotos((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── 스탬프 인증 ──
  const handleStampFileSelected = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || verifyingStopId === null) return;
    const stopId = verifyingStopId;
    const abort = new AbortController();
    stampAbortRef.current = abort;
    setVerifyStep('locating');
    setIsVerifying(true);
    // 실패 문구를 고를 때 위치를 참고하므로 catch 에서도 읽을 수 있게 밖에 둔다
    let location: { x: number; y: number; accuracy: number } | null = null;
    try {
      location = await getCurrentLocation();
      if (abort.signal.aborted) return;
      if (!location) {
        // 서버는 좌표로 인증 범위를 판정하고, 좌표가 없으면 500 을 낸다 (2026-09-08 운영 확인).
        // 이전에는 위치 없이도 전송해 항상 실패 토스트로 끝났다. 보내지 않고 위치 허용을 안내한다.
        toast.error(STAMP_COPY.noLocation.title, {
          description: STAMP_COPY.noLocation.description,
        });
        return;
      }
      setVerifyStep('uploading');
      await planApi.stampPlanPlace(stopId, file, location, { signal: abort.signal });
      toast.success(STAMP_COPY.successToast);
      setVerifyingStopId(null);
      refetch();
      const nowAllVerified = stops.every((s) => s.planPlaceId === stopId || s.isStamped);
      if (nowAllVerified && !celebrationShown) {
        setTimeout(() => {
          setShowCelebration(true);
          setCelebrationShown(true);
        }, 600);
      }
    } catch (err) {
      // 사용자가 취소한 기록은 실패가 아니다
      if (isStampCanceled(err) || abort.signal.aborted) return;
      console.error('기억 스탬프 실패:', err);
      let kind = stampErrorKind(err, location?.accuracy);
      let title: string = STAMP_COPY.error[kind].title;
      if (kind === 'outOfRange' && location) {
        // 예전에는 몇 km 밖에서도 "조금 떨어져 있어요"라고 안내했다. 장소 좌표를 받아 실제 거리를 말한다.
        const distance = await measureDistanceToStop(stopId, location);
        if (distance !== null && distance <= STAMP_RADIUS_M) {
          // 내 좌표로는 반경 안인데 서버는 밖이라고 본다 — 좌표가 흔들린 것이므로 위치 정밀도 문제로 안내
          kind = 'inaccurateLocation';
          title = STAMP_COPY.error[kind].title;
        } else {
          title = outOfRangeTitle(distance);
        }
      }
      toast.error(title, { description: STAMP_COPY.error[kind].description });
      // 다른 기기 등에서 이미 기록된 곳이면 화면을 서버 상태로 맞춘다
      if (kind === 'alreadyStamped') refetch();
    } finally {
      // 취소 뒤 새로 시작한 기록이 있으면 그 상태를 건드리지 않는다
      if (stampAbortRef.current === abort) {
        stampAbortRef.current = null;
        setIsVerifying(false);
      }
      if (stampInputRef.current) stampInputRef.current.value = '';
      if (stampGalleryInputRef.current) stampGalleryInputRef.current.value = '';
    }
  };

  // 범위 밖 안내에 쓸 실제 거리(미터). 플랜 상세에는 장소 좌표가 없어 장소 상세에서 받아온다. 실패하면 null
  const measureDistanceToStop = async (
    planPlaceId: number,
    from: { x: number; y: number }
  ): Promise<number | null> => {
    const stop = stops.find((s) => s.planPlaceId === planPlaceId);
    if (!stop) return null;
    try {
      const place = await placeApi.fetchPlaceDetail(stop.placeId);
      if (!Number.isFinite(place.x) || !Number.isFinite(place.y)) return null;
      return distanceMeters(from, { x: place.x, y: place.y });
    } catch {
      return null;
    }
  };

  // 기록 중 '취소' — 업로드는 끊고, 위치 조회는 결과를 버린다
  const cancelStamp = () => {
    stampAbortRef.current?.abort();
    stampAbortRef.current = null;
    setIsVerifying(false);
    if (stampInputRef.current) stampInputRef.current.value = '';
    if (stampGalleryInputRef.current) stampGalleryInputRef.current.value = '';
  };

  // ── 순서 편집 (프리뷰 → 확정) ──
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const base = orderedPlaces ?? serverPlaces;
    const next = [...base];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setOrderedPlaces(next);
  };

  const buildPlacesBody = (list: PlanPlaceDetail[]) =>
    list.map((p, i) => ({ planPlaceId: p.planPlaceId, placeId: p.placeId, order: i + 1 }));

  const handleFinishReorder = async () => {
    if (!orderedPlaces) return;
    const changed = orderedPlaces.some(
      (p, i) => p.planPlaceId !== serverPlaces[i]?.planPlaceId
    );
    if (!changed) {
      setOrderedPlaces(null);
      return;
    }
    setIsPreviewLoading(true);
    try {
      const preview = await planApi.updatePlanPreview(plan.planId, {
        // 백엔드가 요청의 출발지로 이동시간을 계산하므로 상세 응답의 출발지를 그대로 재전송
        departurePoint: plan.departurePoint ?? undefined,
        places: buildPlacesBody(orderedPlaces),
      });
      setReorderPreview(preview);
    } catch (err) {
      console.error('순서 변경 프리뷰 실패:', err);
      toast.error('변경 결과 계산에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const confirmReorder = async () => {
    if (!orderedPlaces) return;
    setIsSavingOrder(true);
    try {
      await planApi.updatePlanPlaces(plan.planId, {
        departurePoint: plan.departurePoint ?? undefined,
        places: buildPlacesBody(orderedPlaces),
      });
      toast.success('플랜 순서가 저장되었어요!');
      setReorderPreview(null);
      setOrderedPlaces(null);
      refetch();
    } catch (err) {
      console.error('순서 저장 실패:', err);
      toast.error('순서 저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // ── 복제 ──
  const handleClone = async () => {
    if (!cloneDate || !cloneStartTime || !cloneEndTime || isCloning) return;
    setIsCloning(true);
    try {
      // 복제 API 가 일정을 비워 두므로 복제 직후 일정까지 채운다 (clonePlanWithSchedule 참고)
      const res = await planApi.clonePlanWithSchedule(plan.planId, {
        date: cloneDate,
        startTime: cloneStartTime,
        endTime: cloneEndTime,
      });
      setIsCloneOpen(false);
      if (res.scheduleSaved) {
        toast.success('플랜이 복제되었어요!');
      } else {
        toast.warning('플랜은 복제했지만 일정을 저장하지 못했어요.', {
          description: '복제된 플랜에서 여행 일정을 다시 설정해주세요.',
        });
      }
      router.push(`/my-course/${res.planId}`);
    } catch (err) {
      console.error('플랜 복제 실패:', err);
      toast.error('플랜 복제에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsCloning(false);
    }
  };

  // ── 여행 일정 수정 ──
  // 기존 일정이 있으면 그대로, 없으면 오늘 10:00 + 소요시간으로 채워 편집 출발점으로 삼는다.
  const openScheduleEditor = () => {
    if (!canEditSchedule) return;
    const start = startTime || '10:00';
    const today = todayLocalDate();
    // 지난 날짜로는 옮길 수 없다. 기존 날짜가 오늘보다 앞이면(1박 일정의 둘째 날 등) 오늘에서 시작한다.
    setScheduleDate(scheduledDate && scheduledDate >= today ? scheduledDate : today);
    setScheduleStartTime(start);
    setScheduleEndTime(endTime || addMinutesToTime(start, plan.requiredTime));
    setIsScheduleOpen(true);
    setIsMenuOpen(false);
  };

  const isScheduleValid =
    !!scheduleDate &&
    scheduleDate >= todayLocalDate() &&
    !!scheduleStartTime &&
    !!scheduleEndTime &&
    timeToMin(scheduleEndTime) > timeToMin(scheduleStartTime);

  const handleSaveSchedule = async () => {
    if (!canEditSchedule || !isScheduleValid || isSavingSchedule) return;
    setIsSavingSchedule(true);
    try {
      await planApi.updatePlan(plan.planId, {
        tripStartDate: toServerDateTime(scheduleDate, scheduleStartTime),
        tripEndDate: toServerDateTime(scheduleDate, scheduleEndTime),
      });
      setIsScheduleOpen(false);
      toast.success('여행 일정이 저장되었어요!');
      refetch();
    } catch (err) {
      console.error('여행 일정 저장 실패:', err);
      toast.error('여행 일정 저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // ── 이름 수정 / 삭제 ──
  const handleRename = async () => {
    try {
      await planApi.updatePlan(plan.planId, { planTitle: renameText });
      setIsRenameOpen(false);
      toast.success('플랜 이름이 수정되었어요!');
      refetch();
    } catch (err) {
      console.error('플랜 이름 수정 실패:', err);
      toast.error('이름 수정에 실패했어요. 다시 시도해주세요.');
    }
  };

  const handleDelete = async () => {
    try {
      await planApi.deletePlan(plan.planId);
      toast.success('플랜이 삭제되었어요.');
      router.push('/profile');
    } catch (err) {
      console.error('플랜 삭제 실패:', err);
      toast.error('플랜 삭제에 실패했어요. 다시 시도해주세요.');
    }
  };

  // ── 플랜 사진 업로드 ──
  const handleUploadPlanImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImages(true);
    try {
      await planApi.uploadPlanImages(plan.planId, Array.from(files));
      toast.success('사진이 업로드되었어요!');
      refetch();
    } catch (err) {
      console.error('플랜 사진 업로드 실패:', err);
      reportPhotoUploadFailure(err, '사진 업로드에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsUploadingImages(false);
      if (planImageInputRef.current) planImageInputRef.current.value = '';
    }
  };

  // ── 플랜 사진 삭제 — 상세 응답의 planImages(ID) 로 지운다 (2-4) ──
  // 운영(2026-09-16 확인)에서 DELETE 가 200 을 주면서 사진을 지우지 않는 경우가 있어,
  // 응답 상세에 같은 ID 가 남아 있으면 성공으로 알리지 않는다.
  const handleDeletePlanImage = async (planImageId: number) => {
    if (deletingImageId !== null) return;
    setDeletingImageId(planImageId);
    try {
      const after = await planApi.deletePlanImages(plan.planId, [planImageId]);
      const stillThere = after.planImages.some((p) => p.planImageId === planImageId);
      if (stillThere) {
        toast.error('사진 삭제가 반영되지 않았어요. 잠시 후 다시 시도해주세요.');
      } else {
        toast.success('사진을 삭제했어요.');
      }
      refetch();
    } catch (err) {
      console.error('플랜 사진 삭제 실패:', err);
      toast.error('사진 삭제에 실패했어요. 다시 시도해주세요.');
    } finally {
      setDeletingImageId(null);
    }
  };

  // 상세 응답의 planImages(ID 포함) 로 목록을 만든다. 삭제는 ID 로 한다. (2-4)
  const photoItems = plan.planImages;

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: 'smooth' });
    startEditingReview();
  };

  return (
    <div className="bg-white min-h-dvh pb-20 relative">
      {/* 숨김 파일 입력 — 스탬프 인증 / 여행기록 사진 / 플랜 사진 */}
      <input
        ref={stampInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleStampFileSelected(e.target.files)}
      />
      <input
        ref={stampGalleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleStampFileSelected(e.target.files)}
      />
      <input
        ref={reviewPhotoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleAddReviewPhoto(e.target.files)}
      />
      <input
        ref={planImageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUploadPlanImages(e.target.files)}
      />

      {/* 헤더 이미지 */}
      <div className="relative h-60 w-full">
        <CoverImage src={thumbnail} alt={plan.planTitle} seed={plan.planId} size="lg" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start text-white">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold border border-white/10">
              {locationLabel}
            </span>
            <span
              className={`backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                plan.isPlanVisible ? 'bg-primary-500/80' : 'bg-gray-800/80'
              }`}
            >
              {plan.isPlanVisible ? <Eye size={10} /> : <EyeOff size={10} />}
              {plan.isPlanVisible ? '공개 중' : '비공개'}
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight">{plan.planTitle}</h1>
        </div>
      </div>

      {/* 일정 & 진행률 */}
      <div className="px-5 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-500">
            <span className="font-bold text-gray-700">생성</span> {formatCreatedAt(plan.createAt)}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLike}
              aria-pressed={isLiked}
              aria-label={isLiked ? '좋아요 취소' : '좋아요'}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border transition-colors ${
                isLiked
                  ? 'bg-accent-50 border-accent-200 text-accent-600'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
              {likeCount}
            </button>
            <div
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                phase === 'before'
                  ? 'bg-accent-50 text-accent-600'
                  : phase === 'during'
                    ? 'bg-primary-50 text-primary-600'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {PHASE_LABEL[phase]}
            </div>
          </div>
        </div>

        {scheduledDate ? (
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <Calendar size={14} className="text-primary-500" />
            <span>{scheduledDate}</span>
            {startTime && endTime && (
              <>
                <Clock size={14} className="text-primary-500" />
                <span>
                  {startTime} ~ {endTime}
                </span>
              </>
            )}
            {canEditSchedule && (
              <button
                type="button"
                onClick={openScheduleEditor}
                className="ml-auto text-gray-400 underline underline-offset-2"
              >
                변경
              </button>
            )}
          </div>
        ) : (
          // 담기·복제한 플랜은 서버가 일정을 비워 둔다. 이전에는 이 줄이 아예 사라져 시간을 볼 수도 고칠 수도 없었다.
          <div className="flex items-center gap-2 mb-3 text-xs bg-accent-50 border border-accent-100 p-3 rounded-lg">
            <Calendar size={14} className="text-accent-400 shrink-0" />
            <span className="text-accent-600">아직 여행 일정이 없어요.</span>
            <button
              type="button"
              onClick={openScheduleEditor}
              className="ml-auto shrink-0 font-bold text-primary-600 bg-white border border-primary-100 px-2.5 py-1 rounded-full"
            >
              일정 설정
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-gray-400">
            {STAMP_COPY.progressLabel}
            <span className="text-primary-500 text-sm ml-1">
              {completedStops}/{stops.length}
            </span>
          </div>
          {availableMin > 0 && (
            <div className="text-xs text-gray-400">
              예상 <span className="font-bold">{formatMinutes(estimatedTotalMin)}</span> / 여행{' '}
              {formatMinutes(availableMin)}
            </div>
          )}
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {allVerified && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 bg-primary-50 px-3 py-2 rounded-lg border border-primary-100"
          >
            <BadgeCheck size={16} className="text-primary-500" />
            <span className="text-xs font-bold text-primary-600">{STAMP_COPY.allStampedBanner}</span>
          </motion.div>
        )}

        {/* 지난 여행에서 일부만 기록했어도 실패처럼 보이지 않게 남긴 만큼 보여준다 */}
        {phase === 'after' && completedStops > 0 && !allVerified && (
          <div className="mt-3 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
            <BadgeCheck size={16} className="text-gray-400 shrink-0" />
            <span className="text-xs font-bold text-gray-600">
              {STAMP_COPY.partialBanner(completedStops, stops.length)}
            </span>
            <button
              type="button"
              onClick={scrollToReview}
              className="ml-auto shrink-0 text-xs font-bold text-primary-600 underline underline-offset-2"
            >
              {STAMP_COPY.partialBannerAction}
            </button>
          </div>
        )}
      </div>

      {/* 여행 기록 섹션 */}
      <div ref={reviewRef} className="p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-gray-900 text-sm">나의 여행 기록</h2>
          {!isEditingReview && (
            <button
              onClick={startEditingReview}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              수정
            </button>
          )}
        </div>

        {isEditingReview ? (
          <div className="bg-white p-2 rounded-xl border border-primary-200 shadow-sm">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="이번 여행은 어땠나요? 기록을 남겨보세요."
              className="w-full text-base p-2 outline-none resize-none h-20 text-gray-700"
            />
            <div className="grid grid-cols-3 gap-1.5 px-2 mb-2">
              {/* 이미 저장된 사진 — 삭제는 '플랜 사진 관리' 시트에서 (이미지 ID 가 올 때만 가능) */}
              {savedPhotos.map((photo, i) => (
                <div
                  key={`saved-${i}`}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                >
                  <ReviewPhoto src={photo} alt={`여행 기록 사진 ${i + 1}`} />
                </div>
              ))}
              {pendingPhotos.map((photo, i) => (
                <div
                  key={photo.url}
                  className="relative aspect-square rounded-lg overflow-hidden border border-primary-200"
                >
                  <Image src={photo.url} alt={`추가할 사진 ${i + 1}`} fill sizes="100px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePendingPhoto(i)}
                    aria-label="사진 제거"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {savedPhotos.length + pendingPhotos.length < MAX_REVIEW_PHOTOS && (
                <button
                  type="button"
                  onClick={() => reviewPhotoInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-400 transition-colors"
                >
                  <ImagePlus size={18} />
                  <span className="text-[9px] mt-0.5">
                    {savedPhotos.length + pendingPhotos.length}/{MAX_REVIEW_PHOTOS}
                  </span>
                </button>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-2 border-t border-gray-50 pt-2">
              <button
                type="button"
                onClick={handleCancelReview}
                disabled={isSavingReview}
                className="text-xs font-bold text-gray-400 px-3 py-1.5"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void handleSaveReview()}
                disabled={isSavingReview}
                className="text-xs font-bold bg-primary-500 text-white px-3 py-1.5 rounded-lg shadow-sm disabled:bg-gray-300 flex items-center gap-1"
              >
                {isSavingReview && <Loader2 size={12} className="animate-spin" />}
                {isSavingReview ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 leading-relaxed min-h-[40px] whitespace-pre-wrap">
              {plan.planDescription || '아직 작성된 기록이 없어요. 여행의 추억을 남겨보세요!'}
            </p>
            {savedPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mt-3">
                {savedPhotos.map((photo, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer shadow-sm relative"
                    onClick={() => setPreviewPhoto(photo)}
                  >
                    <ReviewPhoto src={photo} alt={`여행 기록 사진 ${i + 1}`} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 플랜 타임라인 */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-lg text-gray-900">플랜 타임라인</h2>
          {isReorderMode ? (
            <button
              onClick={handleFinishReorder}
              disabled={isPreviewLoading}
              className="flex items-center gap-1 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full disabled:opacity-50"
            >
              <Check size={14} /> {isPreviewLoading ? '계산 중...' : '완료'}
            </button>
          ) : (
            canEdit && (
              <button
                onClick={() => setOrderedPlaces(serverPlaces)}
                className="text-xs text-gray-400 underline"
              >
                순서 편집
              </button>
            )
          )}
        </div>

        {startTime && endTime && (
          <div className="flex items-center gap-2 mb-2 text-xs text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
            <Timer size={14} />
            <span className="font-bold">{startTime}</span>
            <span>~</span>
            <span className="font-bold">{endTime}</span>
            <span className="text-primary-400 ml-1">· 예상 완료 {formatMinutes(estimatedTotalMin)}</span>
          </div>
        )}

        <div className="flex items-start gap-2 mb-4 bg-accent-50 p-3 rounded-lg border border-accent-100">
          <Info size={14} className="text-accent-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] text-accent-600 leading-relaxed">{STAMP_COPY.guide[phase]}</p>
            {/* 마감된 여행은 일정을 바꿀 수 없다 — 복제해서 새 일정으로 시작한다 */}
            {phase === 'after' && (
              <button
                type="button"
                onClick={() => setIsCloneOpen(true)}
                className="mt-1 text-[11px] font-bold text-primary-600 underline underline-offset-2"
              >
                {STAMP_COPY.cloneCta}
              </button>
            )}
          </div>
        </div>

        {/* 세로 라인과 점을 같은 기준(left-2, 중심 8px)에 놓는다 — CourseViewPage 와 같은 방식.
            이전에는 border-l-2 + pl-4 컨테이너 안에서 점을 -left-[21px] 로 찍어
            점 중심(5px)이 선 중심(1px)보다 4px 오른쪽에 놓였다 (QA C-03). */}
        <div className="relative space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:-translate-x-1/2 before:bg-gray-100 before:content-['']">
          {stops.map((stop, index) => (
            <div key={stop.planPlaceId} className="relative pl-9">
              <div
                className={`absolute left-2 -translate-x-1/2 top-0 w-4 h-4 rounded-full border-2 z-10 bg-white ${
                  stop.isStamped ? 'border-primary-500' : 'border-gray-300'
                }`}
              >
                {stop.isStamped && <div className="w-2 h-2 bg-primary-500 rounded-full m-0.5" />}
              </div>

              <div
                className={`relative bg-white rounded-xl border p-4 transition-all ${
                  stop.isStamped ? 'border-primary-200 shadow-md shadow-primary-50' : 'border-gray-100 shadow-sm'
                }`}
              >
                {stop.isStamped && (
                  <motion.div
                    initial={{ scale: 2, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: -12 }}
                    className="absolute -right-2 -top-4 w-16 h-16 pointer-events-none z-20"
                  >
                    <div className="w-full h-full border-4 border-red-500/30 rounded-full flex items-center justify-center rotate-12">
                      <span className="text-red-500/40 font-black text-xs uppercase tracking-widest border-y-2 border-red-500/30 py-1 rotate-[-12deg]">
                        {STAMP_COPY.stampMark}
                      </span>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded mb-1 inline-block">
                      {stop.categoryName}
                    </span>
                    <h3 className="font-bold text-gray-900">{stop.placeName}</h3>
                  </div>
                  {stop.isStamped ? (
                    <div className="flex items-center gap-1 text-primary-600 text-xs font-bold bg-primary-50 px-2 py-1 rounded-full">
                      <BadgeCheck size={14} /> {STAMP_COPY.stampedBadge}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">{stop.visitTime}</span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mb-2">{stop.stayDescription || stop.address}</p>

                <div className="flex items-center gap-3 text-[11px] text-gray-400 bg-gray-50 p-2 rounded-lg mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> 추천 체류 {stop.stayTime || 60}분
                  </span>
                  {index < stops.length - 1 && (
                    <span className="flex items-center gap-1">
                      이동 약 {stops[index + 1]?.travelTime || 15}분
                    </span>
                  )}
                </div>

                {isReorderMode ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveStop(index, 'up')}
                      disabled={index === 0}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-bold disabled:opacity-30"
                    >
                      <ChevronUp size={16} /> 위로
                    </button>
                    <button
                      onClick={() => handleMoveStop(index, 'down')}
                      disabled={index === stops.length - 1}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-bold disabled:opacity-30"
                    >
                      <ChevronDown size={16} /> 아래로
                    </button>
                  </div>
                ) : canVerify && !stop.isStamped ? (
                  <button
                    onClick={() => setVerifyingStopId(stop.planPlaceId)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm font-bold hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <Camera size={16} /> {STAMP_COPY.recordButton}
                  </button>
                ) : !stop.isStamped ? (
                  <div className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gray-50 text-gray-400 text-sm">
                    {phase === 'after' ? (
                      STAMP_COPY.restedLabel
                    ) : (
                      <>
                        <Camera size={16} />
                        {phase === 'before'
                          ? STAMP_COPY.lockedBefore(tripDayLabel)
                          : STAMP_COPY.lockedUnscheduled}
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 모달: 위치 인증 ─── */}
      {verifyingStopId !== null && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isVerifying && setVerifyingStopId(null)}
          />
          <div className="relative w-full max-w-xs bg-white rounded-3xl p-6">
            <div className="flex flex-col items-center text-center">
              {isVerifying ? (
                <>
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 border-4 border-primary-100 rounded-full animate-ping" />
                    <MapPin size={32} className="text-primary-500 animate-bounce" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{STAMP_COPY.recordingTitle}</h3>
                  <p className="text-sm text-gray-500" aria-live="polite">
                    {STAMP_COPY.recordingStep[verifyStep]}
                  </p>
                  <button onClick={cancelStamp} className="mt-5 w-full text-gray-400 font-bold text-sm py-2">
                    {STAMP_COPY.recordingCancel}
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Camera size={32} className="text-gray-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{STAMP_COPY.modalTitle}</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    {STAMP_COPY.modalBodyLine1}
                    <br />
                    {STAMP_COPY.modalBodyLine2}
                  </p>
                  <button
                    onClick={() => stampInputRef.current?.click()}
                    className="w-full bg-primary-500 text-white font-bold py-3.5 rounded-xl active:scale-95 transition-transform mb-2"
                  >
                    {STAMP_COPY.cameraButton}
                  </button>
                  <button
                    onClick={() => stampGalleryInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 text-gray-600 font-bold text-sm py-3 rounded-xl border border-gray-200 active:scale-95 transition-transform mb-3"
                  >
                    <Images size={16} /> {STAMP_COPY.galleryButton}
                  </button>
                  <button
                    onClick={() => setVerifyingStopId(null)}
                    className="w-full text-gray-400 font-bold text-sm py-2"
                  >
                    나중에 하기
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 모달: 순서 변경 프리뷰 확인 ─── */}
      {reorderPreview && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReorderPreview(null)} />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-1">순서 변경 저장</h3>
            <p className="text-xs text-gray-400 mb-4">변경된 순서 기준으로 다시 계산했어요.</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg text-sm">
                <span className="text-gray-500">예상 소요시간</span>
                <span className="font-bold text-gray-900">
                  {formatMinutes(estimatedTotalMin)}
                  <span className="text-primary-500"> → {formatMinutes(reorderPreview.requiredTime)}</span>
                </span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg text-sm">
                <span className="text-gray-500">총 이동 거리</span>
                <span className="font-bold text-gray-900">
                  {plan.totalDistance}km
                  <span className="text-primary-500"> → {reorderPreview.totalDistance}km</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setReorderPreview(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg text-sm"
              >
                계속 편집
              </button>
              <button
                onClick={confirmReorder}
                disabled={isSavingOrder}
                className="flex-1 py-2.5 bg-primary-500 text-white font-bold rounded-lg text-sm disabled:opacity-50"
              >
                {isSavingOrder ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 모달: 사진 미리보기 ─── */}
      {!!previewPhoto && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90" onClick={() => setPreviewPhoto(null)} />
          <div className="relative max-w-full max-h-[70vh] rounded-xl overflow-hidden">
            <Image src={previewPhoto} alt="Preview" width={400} height={400} className="object-contain" />
          </div>
          <button
            onClick={() => setPreviewPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* ─── 모달: 복제 ─── */}
      {isCloneOpen && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCloneOpen(false)} />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-1">플랜 복제하기</h3>
            <p className="text-xs text-gray-400 mb-4">새로운 날짜와 시간을 설정해주세요.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">여행 날짜</label>
                <input
                  type="date"
                  value={cloneDate}
                  onChange={(e) => setCloneDate(e.target.value)}
                  min={todayLocalDate()}
                  className="w-full p-3 border border-gray-200 rounded-xl text-base"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">시작 시간</label>
                <select
                  value={cloneStartTime}
                  onChange={(e) => setCloneStartTime(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm appearance-none"
                >
                  <option value="">선택</option>
                  {HALF_HOURS.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">종료 시간</label>
                <select
                  value={cloneEndTime}
                  onChange={(e) => setCloneEndTime(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm appearance-none"
                >
                  <option value="">선택</option>
                  {HALF_HOURS.filter(
                    (h) => !cloneStartTime || timeToMin(h.value) > timeToMin(cloneStartTime)
                  ).map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsCloneOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg text-sm"
              >
                취소
              </button>
              <button
                onClick={handleClone}
                disabled={isCloning}
                className="flex-1 py-2.5 bg-primary-500 text-white font-bold rounded-lg text-sm disabled:opacity-50"
              >
                {isCloning ? '복제 중...' : '복제하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 모달: 여행 일정 수정 ─── */}
      {isScheduleOpen && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isSavingSchedule && setIsScheduleOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-1">여행 일정 수정</h3>
            <p className="text-xs text-gray-400 mb-4">
              소요시간 {formatMinutes(plan.requiredTime)} 기준으로 종료 시간을 먼저 채워뒀어요.
            </p>
            <div className="space-y-3">
              <div>
                <label htmlFor="schedule-date" className="text-xs font-bold text-gray-500 mb-1 block">
                  여행 날짜
                </label>
                <input
                  id="schedule-date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={todayLocalDate()}
                  className="w-full p-3 border border-gray-200 rounded-xl text-base"
                />
              </div>
              <div>
                <label htmlFor="schedule-start" className="text-xs font-bold text-gray-500 mb-1 block">
                  시작 시간
                </label>
                <select
                  id="schedule-start"
                  value={scheduleStartTime}
                  onChange={(e) => {
                    const next = e.target.value;
                    setScheduleStartTime(next);
                    // 종료가 시작보다 앞서게 되면 소요시간 기준으로 다시 맞춘다
                    if (!scheduleEndTime || timeToMin(scheduleEndTime) <= timeToMin(next)) {
                      setScheduleEndTime(addMinutesToTime(next, plan.requiredTime));
                    }
                  }}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm appearance-none"
                >
                  {HALF_HOURS.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="schedule-end" className="text-xs font-bold text-gray-500 mb-1 block">
                  종료 시간
                </label>
                <select
                  id="schedule-end"
                  value={scheduleEndTime}
                  onChange={(e) => setScheduleEndTime(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm appearance-none"
                >
                  {HALF_HOURS.filter((h) => timeToMin(h.value) > timeToMin(scheduleStartTime || '00:00')).map(
                    (h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsScheduleOpen(false)}
                disabled={isSavingSchedule}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg text-sm"
              >
                취소
              </button>
              <button
                onClick={() => void handleSaveSchedule()}
                disabled={!isScheduleValid || isSavingSchedule}
                className="flex-1 py-2.5 bg-primary-500 text-white font-bold rounded-lg text-sm disabled:opacity-50"
              >
                {isSavingSchedule ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 모달: 이름 수정 ─── */}
      {isRenameOpen && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsRenameOpen(false)} />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-4">플랜 이름 수정</h3>
            <input
              type="text"
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 text-base"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsRenameOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg text-sm"
              >
                취소
              </button>
              <button
                onClick={handleRename}
                className="flex-1 py-2.5 bg-primary-500 text-white font-bold rounded-lg text-sm"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 모달: 삭제 확인 ─── */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteConfirmOpen(false)} />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-2">플랜 삭제 확인</h3>
            <p className="text-sm text-gray-500 mb-4">이 플랜을 삭제하시겠어요?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg text-sm"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-lg text-sm"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 바텀시트: 플랜 사진 관리 ─── */}
      {isPhotoSheetOpen && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsPhotoSheetOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-5 shadow-xl max-h-[70vh] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">플랜 사진 관리</h3>
              <span className="text-xs text-gray-400">{photoItems.length}장</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {photoItems.map((item, i) => (
                <div
                  key={`${item.imageUrl}-${i}`}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                  onClick={() => setPreviewPhoto(item.imageUrl)}
                >
                  <ReviewPhoto src={item.imageUrl} alt={`플랜 사진 ${i + 1}`} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeletePlanImage(item.planImageId);
                    }}
                    disabled={deletingImageId !== null}
                    aria-label="사진 삭제"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-50"
                  >
                    {deletingImageId === item.planImageId ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <X size={10} />
                    )}
                  </button>
                </div>
              ))}
              <button
                onClick={() => planImageInputRef.current?.click()}
                disabled={isUploadingImages}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-400 transition-colors disabled:opacity-50"
              >
                <ImagePlus size={20} />
                <span className="text-[9px] mt-0.5">{isUploadingImages ? '업로드 중...' : '추가'}</span>
              </button>
            </div>
            <button
              onClick={() => setIsPhotoSheetOpen(false)}
              className="w-full py-3 text-gray-400 font-bold text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* ─── 더보기 메뉴 ─── */}
      {isMenuOpen && (
        <div className="fixed inset-y-0 app-frame z-[120] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-4 shadow-xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            {/* 일정 수정은 마감 전·기록이 없을 때만. 마감된 여행은 아래 '플랜 복제하기'로 새 일정을 만든다 */}
            {canEditSchedule ? (
              <button
                onClick={openScheduleEditor}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
              >
                <Calendar size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">여행 일정 수정</span>
              </button>
            ) : canEdit ? (
              <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl">
                <Calendar size={18} className="text-gray-300 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-gray-300">여행 일정 수정</span>
                  <span className="block text-xs text-gray-400">{STAMP_COPY.scheduleLockedStamped}</span>
                </span>
              </div>
            ) : null}
            {canEdit && (
              <>
                <button
                  onClick={() => {
                    setRenameText(plan.planTitle);
                    setIsRenameOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
                >
                  <Pencil size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">플랜 이름 수정</span>
                </button>
                <button
                  onClick={() => {
                    setOrderedPlaces(serverPlaces);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
                >
                  <ArrowUpDown size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">플랜 순서 편집</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                setIsPhotoSheetOpen(true);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
            >
              <Images size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">플랜 사진 관리</span>
            </button>
            <button
              onClick={() => {
                setIsCloneOpen(true);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
            >
              <Copy size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">플랜 복제하기</span>
            </button>
            <button
              onClick={() => {
                setIsDeleteConfirmOpen(true);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
            >
              <Trash2 size={18} className="text-red-500" />
              <span className="text-sm font-medium text-red-500">플랜 삭제</span>
            </button>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-3 text-gray-400 font-bold text-sm mt-1"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* ─── 완주 축하 오버레이 ─── */}
      {showCelebration && (
        <div className="fixed inset-y-0 app-frame z-[120] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="bg-white rounded-3xl p-8 w-full max-w-xs text-center"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-black text-gray-900 mb-2">{STAMP_COPY.celebrationTitle}</h2>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-bold text-gray-700">{plan.planTitle}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {STAMP_COPY.celebrationBody(stops.length)}
            </p>
            <button
              onClick={() => {
                setShowCelebration(false);
                scrollToReview();
              }}
              className="w-full bg-primary-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-200 active:scale-95 transition-transform"
            >
              여행 기록 남기기
            </button>
            <button
              onClick={() => setShowCelebration(false)}
              className="w-full mt-2 text-gray-400 font-bold py-2 text-sm"
            >
              닫기
            </button>
          </motion.div>
        </div>
      )}

      <ShareBottomSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={plan.planTitle}
      />
    </div>
  );
}
