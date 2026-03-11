'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
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
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCourseStore } from '@/shared/lib/stores/useCourseStore';
import { ShareBottomSheet } from '@/shared/ui/ShareBottomSheet';

const SAMPLE_REVIEW_PHOTOS = [
  'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=1080&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1080&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1080&auto=format&fit=crop',
];

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
function parseStayMin(t: string): number {
  const match = t.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}
function formatCreatedAt(iso?: string): string {
  if (!iso) return '방금 전';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

type CoursePhase = 'before' | 'during' | 'after';
function getCoursePhase(date?: string, startTime?: string, endTime?: string): CoursePhase {
  if (!date || !startTime || !endTime) return 'during';
  const now = new Date();
  const [y, mo, d] = date.split('-').map(Number);
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const start = new Date(y, mo - 1, d, sh, sm);
  const end = new Date(y, mo - 1, d, eh, em);
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

interface MyCourseDetailPageProps {
  courseId: string;
}

export function MyCourseDetailPage({ courseId }: MyCourseDetailPageProps) {
  const router = useRouter();
  const { myCourses, updateMyCourse, deleteMyCourse, addMyCourse } = useCourseStore();
  const course = myCourses.find((c) => c.id === courseId);

  const reviewRef = useRef<HTMLDivElement>(null);

  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewText, setReviewText] = useState(course?.review || '');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [verifyingStopId, setVerifyingStopId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameText, setRenameText] = useState(course?.title || '');
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);

  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [cloneDate, setCloneDate] = useState('');
  const [cloneStartTime, setCloneStartTime] = useState('');
  const [cloneEndTime, setCloneEndTime] = useState('');

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        코스를 찾을 수 없습니다.
      </div>
    );
  }

  const phase = getCoursePhase(course.scheduledDate, course.scheduledStartTime, course.scheduledEndTime);
  const canEdit = phase !== 'after';
  const canVerify = phase === 'during';
  const allVerified = course.stops.every((s) => s.isVerified);

  const totalStayMin = course.stops.reduce((sum, s) => sum + parseStayMin(s.time || '60분'), 0);
  const travelMin = Math.max(0, course.stops.length - 1) * 15;
  const estimatedTotalMin = totalStayMin + travelMin;
  const availableMin =
    course.scheduledStartTime && course.scheduledEndTime
      ? timeToMin(course.scheduledEndTime) - timeToMin(course.scheduledStartTime)
      : 0;

  const completedStops = course.stops.filter((s) => s.isVerified).length;
  const progress = (completedStops / course.stops.length) * 100;

  const handleSaveReview = () => {
    updateMyCourse(course.id, { review: reviewText });
    setIsEditingReview(false);
    toast.success('여행 기록이 저장되었어요!');
  };

  const handleAddPhoto = () => {
    if (reviewPhotos.length >= 6) return;
    const nextPhoto = SAMPLE_REVIEW_PHOTOS[reviewPhotos.length % SAMPLE_REVIEW_PHOTOS.length];
    setReviewPhotos((prev) => [...prev, nextPhoto]);
    toast.success('사진이 추가되었어요!');
  };

  const handleRemovePhoto = (index: number) => {
    setReviewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVerify = () => {
    if (!verifyingStopId) return;
    setIsVerifying(true);
    setTimeout(() => {
      const updatedStops = course.stops.map((s) =>
        s.id === verifyingStopId
          ? {
              ...s,
              isVerified: true,
              verifiedImage:
                'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop',
            }
          : s
      );
      updateMyCourse(course.id, { stops: updatedStops });
      setIsVerifying(false);
      setVerifyingStopId(null);
      toast.success('정거장 인증 완료!');
      const nowAllVerified = updatedStops.every((s) => s.isVerified);
      if (nowAllVerified && !celebrationShown) {
        updateMyCourse(course.id, { completedAt: new Date().toISOString() });
        setTimeout(() => {
          setShowCelebration(true);
          setCelebrationShown(true);
        }, 600);
      }
    }, 2000);
  };

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...course.stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
    updateMyCourse(course.id, { stops: newStops });
  };

  const handleClone = () => {
    if (!cloneDate || !cloneStartTime || !cloneEndTime) return;
    const cloned = {
      ...course,
      id: `my-${Date.now()}`,
      scheduledDate: cloneDate,
      scheduledStartTime: cloneStartTime,
      scheduledEndTime: cloneEndTime,
      createdAt: new Date().toISOString(),
      completedAt: undefined,
      review: '',
      stops: course.stops.map((s) => ({ ...s, isVerified: false, verifiedImage: undefined })),
    };
    addMyCourse(cloned);
    setIsCloneOpen(false);
    router.push(`/my-course/${cloned.id}`);
  };

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsEditingReview(true);
  };

  return (
    <div className="bg-white min-h-screen pb-20 relative">
      {/* 헤더 이미지 */}
      <div className="relative h-60 w-full">
        <Image src={course.thumbnail} alt={course.title} fill sizes="100vw" className="object-cover" />
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
              {course.location}
            </span>
            <span
              className={`backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${
                course.isPublic ? 'bg-sky-500/80' : 'bg-gray-800/80'
              }`}
            >
              {course.isPublic ? <Eye size={10} /> : <EyeOff size={10} />}
              {course.isPublic ? '공개 중' : '비공개'}
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight">{course.title}</h1>
        </div>
      </div>

      {/* 일정 & 진행률 */}
      <div className="px-5 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-500">
            <span className="font-bold text-gray-700">생성</span>{' '}
            {formatCreatedAt(course.createdAt)}
          </div>
          <div
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              phase === 'before'
                ? 'bg-amber-50 text-amber-600'
                : phase === 'during'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {phase === 'before' ? '여행 전' : phase === 'during' ? '여행 중' : '여행 완료'}
          </div>
        </div>

        {course.scheduledDate && (
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <Calendar size={14} className="text-sky-500" />
            <span>{course.scheduledDate}</span>
            {course.scheduledStartTime && course.scheduledEndTime && (
              <>
                <Clock size={14} className="text-sky-500" />
                <span>
                  {course.scheduledStartTime} ~ {course.scheduledEndTime}
                </span>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-gray-400">
            진행률{' '}
            <span className="text-sky-500 text-sm ml-1">{Math.round(progress)}%</span>
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
            className="h-full bg-sky-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {(allVerified || course.completedAt) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100"
          >
            <BadgeCheck size={16} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600">
              코스 완주 완료 · {course.completedAt ? formatCreatedAt(course.completedAt) : '방금 전'}
            </span>
          </motion.div>
        )}
      </div>

      {/* 여행 기록 섹션 */}
      <div ref={reviewRef} className="p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-gray-900 text-sm">나의 여행 기록</h2>
          {!isEditingReview && (
            <button
              onClick={() => setIsEditingReview(true)}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              수정
            </button>
          )}
        </div>

        {isEditingReview ? (
          <div className="bg-white p-2 rounded-xl border border-sky-200 shadow-sm">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="이번 여행은 어땠나요? 기록을 남겨보세요."
              className="w-full text-base p-2 outline-none resize-none h-20 text-gray-700"
            />
            <div className="grid grid-cols-3 gap-1.5 px-2 mb-2">
              {reviewPhotos.map((photo, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                >
                  <Image src={photo} alt={`Review ${i}`} fill sizes="100px" className="object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {reviewPhotos.length < 6 && (
                <button
                  onClick={handleAddPhoto}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-sky-400 hover:text-sky-400 transition-colors"
                >
                  <ImagePlus size={18} />
                  <span className="text-[9px] mt-0.5">{reviewPhotos.length}/6</span>
                </button>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-2 border-t border-gray-50 pt-2">
              <button
                onClick={() => setIsEditingReview(false)}
                className="text-xs font-bold text-gray-400 px-3 py-1.5"
              >
                취소
              </button>
              <button
                onClick={handleSaveReview}
                className="text-xs font-bold bg-sky-500 text-white px-3 py-1.5 rounded-lg shadow-sm"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 leading-relaxed min-h-[40px] whitespace-pre-wrap">
              {course.review || '아직 작성된 기록이 없어요. 여행의 추억을 남겨보세요!'}
            </p>
            {reviewPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mt-3">
                {reviewPhotos.map((photo, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer shadow-sm relative"
                    onClick={() => setPreviewPhoto(photo)}
                  >
                    <Image src={photo} alt={`Review ${i}`} fill sizes="100px" className="object-cover" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 코스 타임라인 */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-lg text-gray-900">코스 타임라인</h2>
          {isReorderMode ? (
            <button
              onClick={() => setIsReorderMode(false)}
              className="flex items-center gap-1 text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full"
            >
              <Check size={14} /> 완료
            </button>
          ) : (
            canEdit && (
              <button
                onClick={() => setIsReorderMode(true)}
                className="text-xs text-gray-400 underline"
              >
                순서 편집
              </button>
            )
          )}
        </div>

        {course.scheduledStartTime && course.scheduledEndTime && (
          <div className="flex items-center gap-2 mb-2 text-xs text-sky-600 bg-sky-50 px-3 py-2 rounded-lg">
            <Timer size={14} />
            <span className="font-bold">{course.scheduledStartTime}</span>
            <span>~</span>
            <span className="font-bold">{course.scheduledEndTime}</span>
            <span className="text-sky-400 ml-1">
              · 예상 완료 {formatMinutes(estimatedTotalMin)}
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100">
          <Info size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-600 leading-relaxed">
            {canVerify
              ? '각 장소에 도착하면 위치 인증을 해주세요.'
              : phase === 'before'
                ? '여행 시작 시간이 되면 위치 인증이 활성화됩니다.'
                : '여행 기간이 종료되어 인증 및 수정이 불가합니다.'}
          </p>
        </div>

        <div className="space-y-6 relative pl-4 border-l-2 border-gray-100">
          {course.stops.map((stop, index) => {
            const stayMin = parseStayMin(stop.time || '60분');
            return (
              <div key={stop.id} className="relative pl-6">
                <div
                  className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 z-10 bg-white ${
                    stop.isVerified ? 'border-sky-500' : 'border-gray-300'
                  }`}
                >
                  {stop.isVerified && (
                    <div className="w-2 h-2 bg-sky-500 rounded-full m-0.5" />
                  )}
                </div>

                <div
                  className={`relative bg-white rounded-xl border p-4 transition-all ${
                    stop.isVerified ? 'border-sky-200 shadow-md shadow-sky-50' : 'border-gray-100 shadow-sm'
                  }`}
                >
                  {stop.isVerified && (
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
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded mb-1 inline-block">
                        {stop.category}
                      </span>
                      <h3 className="font-bold text-gray-900">{stop.name}</h3>
                    </div>
                    {stop.isVerified ? (
                      <div className="flex items-center gap-1 text-sky-600 text-xs font-bold bg-sky-50 px-2 py-1 rounded-full">
                        <BadgeCheck size={14} /> 인증됨
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">{stop.time}</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-2">{stop.description}</p>

                  <div className="flex items-center gap-3 text-[11px] text-gray-400 bg-gray-50 p-2 rounded-lg mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> 추천 체류 {stayMin}분
                    </span>
                    {index < course.stops.length - 1 && (
                      <span className="flex items-center gap-1">이동 약 15분</span>
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
                        disabled={index === course.stops.length - 1}
                        className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-bold disabled:opacity-30"
                      >
                        <ChevronDown size={16} /> 아래로
                      </button>
                    </div>
                  ) : stop.isVerified && stop.verifiedImage ? (
                    <div className="w-full h-32 rounded-lg overflow-hidden relative">
                      <Image
                        src={stop.verifiedImage}
                        alt="Verified"
                        fill
                        sizes="100%"
                        className="object-cover"
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white text-[10px] bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                        <MapPin size={10} /> 위치 인증 완료
                      </div>
                    </div>
                  ) : canVerify ? (
                    <button
                      onClick={() => setVerifyingStopId(stop.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm font-bold hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <Camera size={16} /> 사진 찍고 인증하기
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gray-50 text-gray-300 text-sm">
                      <Camera size={16} />
                      {phase === 'before' ? '여행 시작 후 인증 가능' : '인증 기간 종료'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 모달: 위치 인증 ─── */}
      {!!verifyingStopId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setVerifyingStopId(null)} />
          <div className="relative w-full max-w-xs bg-white rounded-3xl p-6">
            <div className="flex flex-col items-center text-center">
              {isVerifying ? (
                <>
                  <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 border-4 border-sky-100 rounded-full animate-ping" />
                    <MapPin size={32} className="text-sky-500 animate-bounce" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">위치 확인 중...</h3>
                  <p className="text-sm text-gray-500">현재 위치와 장소를 대조하고 있어요.</p>
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
                    onClick={handleVerify}
                    className="w-full bg-sky-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-200 active:scale-95 transition-transform mb-3"
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

      {/* ─── 모달: 사진 미리보기 ─── */}
      {!!previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCloneOpen(false)} />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-1">코스 복제하기</h3>
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
                className="flex-1 py-2.5 bg-sky-500 text-white font-bold rounded-lg text-sm"
              >
                복제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 모달: 이름 수정 ─── */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsRenameOpen(false)} />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-4">코스 이름 수정</h3>
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
                onClick={() => {
                  updateMyCourse(course.id, { title: renameText });
                  setIsRenameOpen(false);
                }}
                className="flex-1 py-2.5 bg-sky-500 text-white font-bold rounded-lg text-sm"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 모달: 삭제 확인 ─── */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteConfirmOpen(false)} />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-2">코스 삭제 확인</h3>
            <p className="text-sm text-gray-500 mb-4">이 코스를 삭제하시겠어요?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg text-sm"
              >
                취소
              </button>
              <button
                onClick={() => {
                  deleteMyCourse(course.id);
                  router.push('/profile');
                }}
                className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-lg text-sm"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 더보기 메뉴 ─── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-4 shadow-xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            {canEdit && (
              <>
                <button
                  onClick={() => {
                    setRenameText(course.title);
                    setIsRenameOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
                >
                  <Pencil size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">코스 이름 수정</span>
                </button>
                <button
                  onClick={() => {
                    setIsReorderMode(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
                >
                  <ArrowUpDown size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">코스 순서 편집</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                setIsCloneOpen(true);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
            >
              <Copy size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">코스 복제하기</span>
            </button>
            <button
              onClick={() => {
                setIsDeleteConfirmOpen(true);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
            >
              <Trash2 size={18} className="text-red-500" />
              <span className="text-sm font-medium text-red-500">코스 삭제</span>
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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="bg-white rounded-3xl p-8 w-full max-w-xs text-center"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-black text-gray-900 mb-2">코스 완주!</h2>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-bold text-gray-700">{course.title}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {course.stops.length}개 정거장을 모두 방문했어요 ✨
            </p>
            <button
              onClick={() => {
                setShowCelebration(false);
                scrollToReview();
              }}
              className="w-full bg-sky-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-200 active:scale-95 transition-transform"
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
        title={course.title}
      />
    </div>
  );
}
