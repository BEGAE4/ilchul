'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from '@/shared/ui/SafeImage';
import PlanCover from '@/shared/ui/PlanCover';
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
import { usePlanDetail, usePlanActions, planApi, type PlanPlaceDetail, type PlanPreviewResponse } from '@/features/plan';
import { ShareBottomSheet } from '@/shared/ui/ShareBottomSheet';
import { toServerDateTime } from '@/shared/lib/format/serverDateTime';

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}
function formatMinutes(min: number): string {
  const h = Math.floor(Math.abs(min) / 60);
  const m = Math.abs(min) % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}
// 서버 날짜 문자열 → Date. 'yyyy-MM-dd HH:mm'(@JsonFormat)은 Safari 등에서 Date 파싱이 실패하므로
// 공백 구분자를 'T'로 치환해 ISO 형태로 맞춘 뒤 파싱한다. ISO('...T...')는 그대로 통과.
function parseServerDate(value: string): Date {
  return new Date(value.trim().replace(' ', 'T'));
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

type CoursePhase = 'before' | 'during' | 'after';
function getCoursePhase(tripStart?: string, tripEnd?: string): CoursePhase {
  if (!tripStart || !tripEnd) return 'during';
  const now = new Date();
  const start = parseServerDate(tripStart);
  const end = parseServerDate(tripEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'during';
  if (now < start) return 'before';
  if (now > end) return 'after';
  return 'during';
}

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

// 현재 위치 조회 (실패/거부 시 null — 좌표 없이도 인증 요청은 전송)
function getCurrentLocation(): Promise<{ x: number; y: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ x: pos.coords.longitude, y: pos.coords.latitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}

interface MyCourseDetailPageProps {
  courseId: string;
}

export function MyCourseDetailPage({ courseId }: MyCourseDetailPageProps) {
  const router = useRouter();

  // 플랜 상세는 서버에서만 조회한다. 실패 시 에러 UI를 렌더링한다.
  const { plan, isLoading, error: planError, refetch } = usePlanDetail(courseId);
  // 내 플랜에서도 좋아요는 가능하다 (스크랩은 소유자에게 의미가 없어 제공하지 않는다)
  const { isLiked, likeCount, toggleLike } = usePlanActions(plan);

  const reviewRef = useRef<HTMLDivElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
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

  // 플랜 사진 관리
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

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
        <p className="text-sm text-gray-500 mb-6">잠시 후 다시 시도해주세요.</p>
        <div className="flex gap-2 w-full max-w-xs">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm"
          >
            돌아가기
          </button>
          <button
            onClick={refetch}
            className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-xl text-sm shadow-md shadow-primary-200"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const serverPlaces = [...plan.planPlaceDetailDtos].sort((a, b) => a.orderIndex - b.orderIndex);
  const stops = orderedPlaces ?? serverPlaces;
  const isReorderMode = orderedPlaces !== null;

  // 대표 이미지: 업로드 썸네일 → 플랜 이미지 → 첫 번째 장소 사진. 없으면 PlanCover 의 '사진 없음' UI
  const thumbnail =
    plan.thumbnailUrl || plan.planImageUrls[0] || serverPlaces.find((p) => p.placeImage)?.placeImage || null;
  const locationLabel = serverPlaces[0]?.address?.split(' ').slice(0, 2).join(' ') || '미정';
  const scheduledDate = isoDate(plan.tripStartDate);
  const startTime = isoTime(plan.tripStartDate);
  const endTime = isoTime(plan.tripEndDate);

  const phase = getCoursePhase(plan.tripStartDate, plan.tripEndDate);
  const canEdit = phase !== 'after';
  const canVerify = phase === 'during';
  const allVerified = stops.length > 0 && stops.every((s) => s.isStamped);

  const estimatedTotalMin = plan.requiredTime;
  const availableMin = startTime && endTime ? timeToMin(endTime) - timeToMin(startTime) : 0;

  const completedStops = stops.filter((s) => s.isStamped).length;
  const progress = stops.length > 0 ? (completedStops / stops.length) * 100 : 0;

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
      toast.error('여행 기록 저장에 실패했어요. 다시 시도해주세요.');
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
    setIsVerifying(true);
    try {
      const location = await getCurrentLocation();
      if (!location) {
        // 위치 권한 거부/미지원/timeout 시에도 인증은 진행 — 위치 없이 전송됨을 안내만 한다
        toast.info('현재 위치를 확인할 수 없어 위치 정보 없이 인증했어요.');
      }
      await planApi.stampPlanPlace(verifyingStopId, file, location);
      toast.success('정거장 인증 완료!');
      setVerifyingStopId(null);
      refetch();
      const nowAllVerified = stops.every((s) => s.planPlaceId === verifyingStopId || s.isStamped);
      if (nowAllVerified && !celebrationShown) {
        setTimeout(() => {
          setShowCelebration(true);
          setCelebrationShown(true);
        }, 600);
      }
    } catch (err) {
      console.error('스탬프 인증 실패:', err);
      toast.error('인증에 실패했어요.', {
        description: '위치와 네트워크 상태를 확인한 뒤 다시 시도해주세요.',
      });
    } finally {
      setIsVerifying(false);
      if (stampInputRef.current) stampInputRef.current.value = '';
    }
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
      const res = await planApi.clonePlan(plan.planId, { scheduledDate: cloneDate });
      // 복제 API는 날짜만 받으므로 시간은 수정 API로 반영 (실패해도 복제 자체는 유지)
      await planApi
        .updatePlan(res.planId, {
          tripStartDate: toServerDateTime(cloneDate, cloneStartTime),
          tripEndDate: toServerDateTime(cloneDate, cloneEndTime),
        })
        .catch(() => undefined);
      setIsCloneOpen(false);
      toast.success('플랜이 복제되었어요!');
      router.push(`/my-course/${res.planId}`);
    } catch (err) {
      console.error('플랜 복제 실패:', err);
      toast.error('플랜 복제에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsCloning(false);
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
      toast.error('사진 업로드에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsUploadingImages(false);
      if (planImageInputRef.current) planImageInputRef.current.value = '';
    }
  };

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
        <PlanCover src={thumbnail} alt={plan.planTitle} seed={plan.planId} size="lg" priority />
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
              {phase === 'before' ? '여행 전' : phase === 'during' ? '여행 중' : '여행 완료'}
            </div>
          </div>
        </div>

        {scheduledDate && (
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
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-gray-400">
            진행률 <span className="text-primary-500 text-sm ml-1">{Math.round(progress)}%</span>
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
            <span className="text-xs font-bold text-primary-600">플랜 완주 완료</span>
          </motion.div>
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
              {/* 이미 저장된 사진 — 삭제 API 가 이미지 id 를 요구하는데 상세 응답에 id 가 없어 삭제는 제공하지 않는다 */}
              {savedPhotos.map((photo, i) => (
                <div
                  key={`saved-${i}`}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                >
                  <Image src={photo} alt={`여행 기록 사진 ${i + 1}`} fill sizes="100px" className="object-cover" />
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
                    <Image src={photo} alt={`여행 기록 사진 ${i + 1}`} fill sizes="100px" className="object-cover" />
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
          <p className="text-[11px] text-accent-600 leading-relaxed">
            {canVerify
              ? '각 장소에 도착하면 위치 인증을 해주세요.'
              : phase === 'before'
                ? '여행 시작 시간이 되면 위치 인증이 활성화됩니다.'
                : '여행 기간이 종료되어 인증 및 수정이 불가합니다.'}
          </p>
        </div>

        <div className="space-y-6 relative pl-4 border-l-2 border-gray-100">
          {stops.map((stop, index) => (
            <div key={stop.planPlaceId} className="relative pl-6">
              <div
                className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 z-10 bg-white ${
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
                        Visited
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
                      <BadgeCheck size={14} /> 인증됨
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
                    <Camera size={16} /> 사진 찍고 인증하기
                  </button>
                ) : !stop.isStamped ? (
                  <div className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gray-50 text-gray-300 text-sm">
                    <Camera size={16} />
                    {phase === 'before' ? '여행 시작 후 인증 가능' : '인증 기간 종료'}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 모달: 위치 인증 ─── */}
      {verifyingStopId !== null && (
        <div className="fixed inset-y-0 app-frame z-50 flex items-center justify-center p-4">
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
                  <h3 className="font-bold text-lg text-gray-900 mb-1">인증 중...</h3>
                  <p className="text-sm text-gray-500">사진과 현재 위치를 확인하고 있어요.</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Camera size={32} className="text-gray-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">방문 인증하기</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    이 장소에 도착하셨나요?
                    <br />
                    사진을 찍어 방문을 인증해주세요!
                  </p>
                  <button
                    onClick={() => stampInputRef.current?.click()}
                    className="w-full bg-primary-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-200 active:scale-95 transition-transform mb-3"
                  >
                    카메라 켜기
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
        <div className="fixed inset-y-0 app-frame z-50 flex items-center justify-center p-4">
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
        <div className="fixed inset-y-0 app-frame z-50 flex items-center justify-center p-4">
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
        <div className="fixed inset-y-0 app-frame z-50 flex items-center justify-center p-4">
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
                  min={new Date().toISOString().split('T')[0]}
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

      {/* ─── 모달: 이름 수정 ─── */}
      {isRenameOpen && (
        <div className="fixed inset-y-0 app-frame z-50 flex items-center justify-center p-4">
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
        <div className="fixed inset-y-0 app-frame z-50 flex items-center justify-center p-4">
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
        <div className="fixed inset-y-0 app-frame z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsPhotoSheetOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-5 shadow-xl max-h-[70vh] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">플랜 사진 관리</h3>
              <span className="text-xs text-gray-400">{plan.planImageUrls.length}장</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {plan.planImageUrls.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                  onClick={() => setPreviewPhoto(url)}
                >
                  <Image src={url} alt={`Plan ${i}`} fill sizes="100px" className="object-cover" />
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
            <p className="text-[11px] text-gray-400 mb-3">
              * 사진 삭제는 서버 이미지 ID 제공이 준비되면 지원될 예정이에요.
            </p>
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
        <div className="fixed inset-y-0 app-frame z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-4 shadow-xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
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
        <div className="fixed inset-y-0 app-frame z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="bg-white rounded-3xl p-8 w-full max-w-xs text-center"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-black text-gray-900 mb-2">플랜 완주!</h2>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-bold text-gray-700">{plan.planTitle}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {stops.length}개 정거장을 모두 방문했어요 ✨
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
