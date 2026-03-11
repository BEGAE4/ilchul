'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/shared/ui/Skeleton';
import Image from 'next/image';
import {
  ArrowLeft,
  Clock,
  Share2,
  Heart,
  MapPin,
  ChevronRight,
  Bookmark,
} from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_MAGAZINES } from '@/shared/data/mockData';
import { useCourseStore } from '@/shared/lib/stores/useCourseStore';
import { ShareBottomSheet } from '@/shared/ui/ShareBottomSheet';

interface MagazineDetailPageProps {
  magazineId: string;
}

export function MagazineDetailPage({ magazineId }: MagazineDetailPageProps) {
  const router = useRouter();
  const { courses } = useCourseStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const article = MOCK_MAGAZINES.find((m) => m.id === magazineId);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <p className="mb-3">아티클을 찾을 수 없습니다.</p>
        <button onClick={() => router.back()} className="text-sky-500 font-medium text-sm">
          돌아가기
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <Skeleton className="w-full h-80" />
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="px-5 py-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-56 w-full mt-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  const relatedCourses = courses.filter((c) => article.relatedCourseIds.includes(c.id));

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* 히어로 커버 */}
      <div className="relative h-80 w-full">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* 상단 네비 */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:bg-white/30"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:bg-white/30"
              aria-label="공유하기"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              aria-label="좋아요"
              className={`p-2 backdrop-blur-md rounded-full active:bg-white/30 transition-colors ${
                isLiked ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white'
              }`}
            >
              <Heart size={20} className={isLiked ? 'fill-white' : ''} />
            </button>
          </div>
        </div>

        {/* 타이틀 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-bold bg-white/20 backdrop-blur-sm rounded">
            {article.tag}
          </span>
          <h1 className="text-2xl font-black leading-tight mb-1">{article.title}</h1>
          <p className="text-sm opacity-80">{article.subtitle}</p>
        </div>
      </div>

      {/* 작성자 정보 */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
            <Image
              src={article.authorAvatar}
              alt={article.author}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{article.author}</div>
            <div className="text-xs text-gray-500">{article.date}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
          <Clock size={12} />
          <span>{article.readTime} 읽기</span>
        </div>
      </div>

      {/* 아티클 콘텐츠 */}
      <div className="px-5 py-6">
        {article.sections.map((section, index) => {
          if (section.type === 'text') {
            return (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4 }}
                className="text-sm text-gray-700 leading-[1.8] mb-6"
              >
                {section.content}
              </motion.p>
            );
          }

          if (section.type === 'image') {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
                className="mb-6 -mx-5"
              >
                <div className="relative w-full h-56">
                  <Image
                    src={section.image!}
                    alt={section.caption || ''}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
                {section.caption && (
                  <p className="px-5 mt-2 text-xs text-gray-400 italic">{section.caption}</p>
                )}
              </motion.div>
            );
          }

          if (section.type === 'place') {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4 }}
                className="mb-6 bg-sky-50 border border-sky-100 rounded-2xl p-4"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={14} className="text-sky-500" />
                  <span className="text-xs font-bold text-sky-600">추천 장소</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-0.5">{section.placeName}</h3>
                <p className="text-xs text-gray-500 mb-2">{section.placeLocation}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{section.placeDescription}</p>
              </motion.div>
            );
          }

          return null;
        })}
      </div>

      {/* 관련 코스 */}
      {relatedCourses.length > 0 && (
        <div className="px-5 py-6 border-t border-gray-100 bg-gray-50">
          <h2 className="font-bold text-lg text-gray-900 mb-1">이 매거진과 관련된 코스</h2>
          <p className="text-xs text-gray-500 mb-4">에디터가 추천하는 코스를 직접 따라가 보세요</p>

          <div className="space-y-3">
            {relatedCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => router.push(`/course/${course.id}`)}
                className="flex gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{course.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <MapPin size={10} /> {course.location}
                      </span>
                      <span className="flex items-center gap-0.5 text-sky-500">
                        <Bookmark size={10} /> {course.bookmarks}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 다른 매거진 */}
      <div className="px-5 py-6 border-t border-gray-100">
        <h2 className="font-bold text-lg text-gray-900 mb-4">다른 매거진</h2>
        <div className="space-y-3">
          {MOCK_MAGAZINES.filter((m) => m.id !== magazineId).map((mag) => (
            <div
              key={mag.id}
              onClick={() => router.push(`/magazine/${mag.id}`)}
              className="flex gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={mag.coverImage}
                  alt={mag.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-sky-500 mb-0.5">{mag.tag}</span>
                <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{mag.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {mag.author} · {mag.readTime} 읽기
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-300 self-center" />
            </div>
          ))}
        </div>
      </div>

      <ShareBottomSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={article.title}
      />
    </div>
  );
}
