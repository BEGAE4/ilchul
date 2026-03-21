'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  MapPin,
  Clock,
  Check,
  MessageCircle,
  ThumbsUp,
  MoreVertical,
  Flag,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useCourseStore } from '@/shared/lib/stores/useCourseStore';
import { ShareBottomSheet } from '@/shared/ui/ShareBottomSheet';
import { CourseDetailSkeleton } from '@/shared/ui/Skeleton';
import { MOCK_COMMENTS, REPORT_REASONS } from '@/shared/data/mockData';
import type { Comment } from '@/shared/types';

interface CourseViewPageProps {
  courseId: string;
}

export function CourseViewPage({ courseId }: CourseViewPageProps) {
  const router = useRouter();
  const {
    getCourseById,
    courses,
    toggleBookmark,
    toggleLike,
    isBookmarked,
    isLiked,
    getLikeCount,
    cloneCourseToMy,
  } = useCourseStore();

  const course = getCourseById(courseId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const [shareOpen, setShareOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedCourseId, setSavedCourseId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <p className="mb-4">코스를 찾을 수 없습니다.</p>
        <button onClick={() => router.back()} className="text-blue-500 font-medium">
          돌아가기
        </button>
      </div>
    );
  }

  const bookmarked = isBookmarked(courseId);
  const liked = isLiked(courseId);
  const likeCount = getLikeCount(courseId);

  const handleSaveCourse = () => {
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    const cloned = cloneCourseToMy(courseId);
    if (cloned) {
      setSavedCourseId(cloned.id);
      toast.success('내 일정에 담았어요!');
    }
  };

  const goToMyCourse = () => {
    if (savedCourseId) {
      router.push(`/my-course/${savedCourseId}`);
    }
    setShowSaveModal(false);
    setSavedCourseId(null);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      user: '김여행',
      avatar: 'https://i.pravatar.cc/150?u=me',
      text: commentText,
      date: '방금',
      likes: 0,
    };
    setComments([newComment, ...comments]);
    setCommentText('');
    toast.success('댓글이 등록되었어요!');
  };

  const handleLikeComment = (commentId: string) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  // 관련 코스 — 태그 매칭 또는 같은 지역 기반 필터링
  const relatedCourses = courses
    .filter((c) => c.id !== courseId)
    .filter(
      (c) =>
        c.tags?.some((t) => course.tags?.includes(t)) ||
        c.location === course.location
    )
    .slice(0, 3);

  // 태그/지역 매칭 결과가 3개 미만이면 다른 코스로 채움
  if (relatedCourses.length < 3) {
    const remaining = courses
      .filter((c) => c.id !== courseId && !relatedCourses.some((r) => r.id === c.id))
      .slice(0, 3 - relatedCourses.length);
    relatedCourses.push(...remaining);
  }

  return (
    <div className="bg-white pb-24 min-h-screen relative">
      {/* 히어로 이미지 */}
      <div className="relative h-64 w-full">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/40 to-transparent">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:bg-white/30"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShareOpen(true)}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:bg-white/30"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:bg-white/30"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent text-white">
          <div className="flex gap-2 mb-2">
            {course.tags.map((tag, idx) => (
              <span key={idx} className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold leading-tight mb-1">{course.title}</h1>
          <div className="flex items-center text-sm opacity-90">
            <MapPin size={14} className="mr-1" /> {course.location}
          </div>
        </div>
      </div>

      {/* 작성자 & 팔로우 */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer active:opacity-70"
          onClick={() => router.push(`/profile/${course.author}`)}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
            <Image
              src={course.authorAvatar}
              alt={course.author}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{course.author}</div>
            <div className="text-xs text-gray-500">여행 크리에이터</div>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            toggleLike(courseId);
            toast(liked ? '좋아요를 취소했어요.' : '좋아요를 눌렀어요!');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 font-bold text-sm transition-all ${
            liked
              ? 'bg-red-50 border-red-400 text-red-500'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <Heart size={16} className={liked ? 'fill-red-400 text-red-400' : ''} />
          {likeCount.toLocaleString()}
        </motion.button>
      </div>

      {/* 정보 그리드 */}
      <div className="grid grid-cols-3 gap-1 p-4 text-center">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">소요시간</div>
          <div className="font-bold text-gray-900">{course.duration}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">스크랩</div>
          <div className="font-bold text-gray-900 flex items-center justify-center gap-1">
            <Bookmark size={14} className="text-sky-500" /> {course.bookmarks}
          </div>
        </div>
        <button
          onClick={() => toggleLike(courseId)}
          className="bg-gray-50 p-3 rounded-lg active:bg-gray-100 transition-colors"
        >
          <div className="text-xs text-gray-500 mb-1">좋아요</div>
          <div className="font-bold text-gray-900 flex items-center justify-center gap-1">
            <Heart size={14} className={liked ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
            {likeCount}
          </div>
        </button>
      </div>

      {/* 설명 */}
      <div className="px-5 py-2 mb-6">
        <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
      </div>

      {/* 타임라인 */}
      <div className="px-5">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock size={20} className="text-sky-500" /> 여행 코스 타임라인
        </h2>
        <div className="relative pl-2 space-y-8 before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-sky-200 before:to-gray-100 before:content-['']">
          {course.stops.map((stop) => (
            <div key={stop.id} className="relative pl-8">
              <span className="absolute left-0 top-1.5 -ml-px h-4 w-4 rounded-full border-2 border-white bg-sky-500 shadow-sm z-10" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded w-fit mb-1">
                  {stop.time}
                </span>
                <span className="text-xs text-gray-400 font-medium ml-auto sm:ml-2">
                  {stop.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{stop.name}</h3>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {stop.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 댓글 */}
      <div className="px-5 py-4 border-t border-gray-100 mt-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <MessageCircle size={20} className="text-sky-500" /> 댓글
        </h2>
        <div className="mb-4">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 text-base"
            rows={2}
            maxLength={500}
          />
          <button
            onClick={handleCommentSubmit}
            className="mt-2 w-full bg-sky-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-200 active:scale-[0.98] transition-transform"
          >
            댓글 작성
          </button>
        </div>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                <Image src={comment.avatar} alt="Avatar" fill sizes="36px" className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">{comment.user}</div>
                  <div className="text-xs text-gray-500">{comment.date}</div>
                </div>
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
                  {comment.text}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={`text-sm ${likedComments.has(comment.id) ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <span className="text-sm text-gray-500">
                    {likedComments.has(comment.id) ? comment.likes + 1 : comment.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 관련 코스 */}
      {relatedCourses.length > 0 && (
        <div className="px-5 py-6 border-t border-gray-100 bg-gray-50">
          <h2 className="font-bold text-lg mb-4">이런 코스도 좋아하실 거예요</h2>
          <div className="space-y-3">
            {relatedCourses.map((rc) => (
              <div
                key={rc.id}
                onClick={() => router.push(`/course/${rc.id}`)}
                className="flex gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={rc.thumbnail} alt={rc.title} fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">{rc.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{rc.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                    <span className="flex items-center gap-0.5">
                      <MapPin size={10} /> {rc.location}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Heart size={10} className="text-red-400" /> {rc.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky 하단 FAB */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-2 justify-center max-w-[480px] mx-auto z-50">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            toggleLike(courseId);
            toast(liked ? '좋아요를 취소했어요.' : '좋아요를 눌렀어요!');
          }}
          className={`p-3.5 rounded-xl border transition-colors ${
            liked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}
        >
          <Heart size={22} className={liked ? 'fill-red-500' : ''} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            toggleBookmark(courseId);
            toast.success(bookmarked ? '저장을 해제했어요.' : '코스를 저장했어요!');
          }}
          className={`p-3.5 rounded-xl border transition-colors ${
            bookmarked
              ? 'bg-amber-50 border-amber-200 text-amber-500'
              : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}
        >
          <Bookmark size={22} className={bookmarked ? 'fill-amber-500' : ''} />
        </motion.button>
        <button
          onClick={handleSaveCourse}
          className="flex-1 bg-sky-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-200 active:scale-[0.98] transition-transform"
        >
          이 코스로 일정 담기
        </button>
      </div>

      {/* ─── 모달: 일정 담기 ─── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSaveModal(false)} />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-6">
            {!savedCourseId ? (
              <>
                <h3 className="font-bold text-lg mb-2 text-gray-900">내 일정으로 담기</h3>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-bold text-gray-700">&ldquo;{course.title}&rdquo;</span>
                </p>
                <p className="text-sm text-gray-500 mb-5">
                  이 코스를 내 일정에 추가하시겠어요?
                  <br />
                  담은 후 날짜와 순서를 수정할 수 있어요.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-sm text-gray-600"
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmSave}
                    className="flex-1 py-3 bg-sky-500 font-bold rounded-xl text-sm text-white shadow-md shadow-sky-200"
                  >
                    담기
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-500">
                  <Check size={24} strokeWidth={3} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">일정에 담았어요!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  내 코스 상세에서 날짜를 설정하고
                  <br />
                  여행을 시작해보세요.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      setSavedCourseId(null);
                    }}
                    className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-sm text-gray-600"
                  >
                    계속 구경하기
                  </button>
                  <button
                    onClick={goToMyCourse}
                    className="flex-1 py-3 bg-sky-500 font-bold rounded-xl text-sm text-white shadow-md shadow-sky-200"
                  >
                    코스 보기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 더보기 메뉴 ─── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-4 shadow-xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <button
              onClick={() => {
                toggleBookmark(courseId);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
            >
              <Bookmark size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">코스 저장 / 해제</span>
            </button>
            <button
              onClick={() => {
                setIsReportOpen(true);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-gray-50"
            >
              <Flag size={18} className="text-red-500" />
              <span className="text-sm font-medium text-red-500">신고하기</span>
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

      {/* ─── 신고 다이얼로그 ─── */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsReportOpen(false)} />
          <div className="relative w-full max-w-xs bg-white rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-2 text-gray-900">신고하기</h3>
            <p className="text-sm text-gray-500 mb-5">
              신고 사유를 선택하고 상세 내용을 입력해주세요.
            </p>
            <div className="space-y-2">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 text-base"
              >
                <option value="">신고 사유 선택</option>
                {REPORT_REASONS.map((reason, idx) => (
                  <option key={idx} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <textarea
                value={reportDetail}
                onChange={(e) => setReportDetail(e.target.value)}
                placeholder="상세 내용 입력..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 text-base"
                rows={3}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsReportOpen(false)}
                className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-sm text-gray-600"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (!reportReason) {
                    toast.error('신고 사유를 선택해주세요.');
                    return;
                  }
                  setIsReportOpen(false);
                  setReportReason('');
                  setReportDetail('');
                  toast.success('신고가 접수되었어요.');
                }}
                disabled={!reportReason}
                className="flex-1 py-3 bg-sky-500 font-bold rounded-xl text-sm text-white shadow-md shadow-sky-200 disabled:bg-gray-300 disabled:shadow-none"
              >
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareBottomSheet isOpen={shareOpen} onClose={() => setShareOpen(false)} title={course.title} />
    </div>
  );
}
