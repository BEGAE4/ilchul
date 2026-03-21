'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Heart, Clock, MapPin } from 'lucide-react';
import type { Course } from '@/shared/data/mockData';

interface CourseDetailPageProps {
  course: Course;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  course,
}) => {
  const router = useRouter();

  return (
    <div className="bg-white pb-24 min-h-screen relative">
      {/* Hero Image */}
      <div className="relative h-64 w-full">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/40 to-transparent">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:bg-white/30"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:bg-white/30">
              <Share2 size={20} />
            </button>
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:bg-white/30">
              <Heart size={20} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent text-white">
          <div className="flex gap-2 mb-2">
            {course.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold leading-tight mb-1">
            {course.title}
          </h1>
          <div className="flex items-center text-sm opacity-90">
            <MapPin size={14} className="mr-1" /> {course.location}
          </div>
        </div>
      </div>

      {/* Author & Stats */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={course.authorAvatar}
            alt={course.author}
            className="w-10 h-10 rounded-full border border-gray-200"
          />
          <div>
            <div className="text-sm font-bold text-gray-900">
              {course.author}
            </div>
            <div className="text-xs text-gray-500">여행 크리에이터</div>
          </div>
        </div>
        <button className="bg-sky-50 text-sky-600 px-4 py-1.5 rounded-full text-xs font-bold">
          팔로우
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-1 p-4 text-center">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">소요시간</div>
          <div className="font-bold text-gray-900">{course.duration}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">저장</div>
          <div className="font-bold text-gray-900 flex items-center justify-center gap-1">
            <span className="text-blue-500">🔖</span> {course.bookmarks}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">좋아요</div>
          <div className="font-bold text-gray-900">{course.likes}</div>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 py-2 mb-6">
        <p className="text-gray-600 text-sm leading-relaxed">
          {course.description}
        </p>
      </div>

      {/* Timeline */}
      <div className="px-5">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock size={20} className="text-sky-500" /> 여행 코스 타임라인
        </h2>

        <div className="relative pl-2 space-y-8 before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-sky-200 before:to-gray-100 before:content-['']">
          {course.stops.map((stop) => (
            <div key={stop.id} className="relative pl-8">
              <span className="absolute left-0 top-1.5 -ml-px h-4 w-4 rounded-full border-2 border-white bg-sky-500 shadow-sm z-10" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded w-fit mb-1 sm:mb-0">
                  {stop.time}
                </span>
                <span className="text-xs text-gray-400 font-medium ml-auto sm:ml-2">
                  {stop.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1">
                {stop.name}
              </h3>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {stop.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-center w-[360px] mx-auto z-50">
        <button className="w-full bg-sky-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-200 active:scale-[0.98] transition-transform">
          이 코스로 일정 담기
        </button>
      </div>
    </div>
  );
};
