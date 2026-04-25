'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Heart, Bookmark, MapPin } from 'lucide-react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useCourseStore } from '@/shared/lib/stores/useCourseStore';

const MOCK_USER_PROFILES: Record<string, { name: string; avatar: string; bio: string; title: string }> = {
  '힙스터김': {
    name: '힙스터김',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    bio: '성수동 단골 여행자 ☕ 카페투어 전문',
    title: '트렌드 헌터',
  },
  '바다요정': {
    name: '바다요정',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    bio: '바다 보며 힐링하는 걸 좋아해요 🌊',
    title: '힐링 마스터',
  },
};

interface UserProfilePageProps {
  userId: string;
}

export function UserProfilePage({ userId }: UserProfilePageProps) {
  const router = useRouter();
  const { courses, toggleBookmark, bookmarkedIds } = useCourseStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const userProfile = MOCK_USER_PROFILES[userId];

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="bg-white p-5 border-b border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-28 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-5 w-20" />
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <p className="text-lg font-bold mb-2">사용자를 찾을 수 없습니다</p>
        <button onClick={() => router.back()} className="text-sky-500 font-medium">
          돌아가기
        </button>
      </div>
    );
  }

  const userCourses = useMemo(() =>
    courses.filter((c) => c.author === userProfile.name && c.isPublic !== false),
    [courses, userProfile.name]
  );

  const totalLikes = useMemo(() =>
    userCourses.reduce((sum, c) => sum + c.likes, 0),
    [userCourses]
  );

  const totalBookmarks = useMemo(() =>
    userCourses.reduce((sum, c) => sum + (c.bookmarks ?? 0), 0),
    [userCourses]
  );

  const STATS = [
    { label: '공개 코스', value: userCourses.length, color: 'text-sky-500' },
    { label: '받은 좋아요', value: totalLikes, color: 'text-red-500' },
    { label: '받은 저장', value: totalBookmarks, color: 'text-violet-500' },
  ];

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-gray-700 rounded-full"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{userProfile.name}</h1>
      </div>

      {/* 프로필 섹션 */}
      <div className="bg-white p-5 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={userProfile.avatar}
              alt={userProfile.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{userProfile.name}</h2>
            <p className="text-sm text-gray-500">{userProfile.title}</p>
            {userProfile.bio && (
              <p className="text-xs text-gray-400 mt-1">{userProfile.bio}</p>
            )}
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-3">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-center bg-gray-50 rounded-xl p-3"
            >
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 코스 목록 */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-3">공개 코스</h3>
        {userCourses.length > 0 ? (
          <div className="space-y-4">
            {userCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => router.push(`/course/${course.id}`)}
                className="relative rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="relative h-36">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(course.id);
                      toast.success(bookmarkedIds.has(course.id) ? '저장을 해제했어요.' : '북마크에 저장했어요!');
                    }}
                    className="absolute top-2.5 right-2.5 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow"
                    aria-label="북마크"
                  >
                    <Bookmark
                      size={16}
                      fill={bookmarkedIds.has(course.id) ? '#3b82f6' : 'none'}
                      className="text-blue-500"
                    />
                  </button>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex gap-1.5 mb-1">
                      {course.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] text-white bg-white/20 backdrop-blur-sm rounded px-1.5 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{course.title}</h3>
                  </div>
                </div>
                <div className="bg-white p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin size={10} />
                    <span>{course.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <Heart size={10} className="text-red-400" /> {course.likes}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Bookmark size={10} /> {course.bookmarks}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500 font-medium mb-1">아직 공개된 코스가 없어요</p>
          </div>
        )}
      </div>
    </div>
  );
}
