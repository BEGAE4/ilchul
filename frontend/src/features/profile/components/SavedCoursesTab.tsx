'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Clock, Heart, Bookmark } from 'lucide-react';
import { useCourseStore } from '@/shared/lib/stores/useCourseStore';

export const SavedCoursesTab: React.FC = () => {
  const router = useRouter();
  const { getBookmarkedCourses, bookmarkedIds, toggleBookmark } = useCourseStore();
  const savedCourses = getBookmarkedCourses();

  if (savedCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">🔖</div>
        <p className="text-gray-500 font-medium mb-1">저장한 코스가 없어요</p>
        <p className="text-xs text-gray-400">마음에 드는 코스를 저장해보세요!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {savedCourses.map((course) => (
        <div
          key={course.id}
          onClick={() => router.push(`/course/${course.id}`)}
          className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer"
        >
          <div className="flex">
            <div className="relative w-24 h-24 shrink-0">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {course.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {course.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {course.duration}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(course.id);
                  }}
                  className="p-1.5 text-blue-500"
                >
                  <Bookmark
                    size={16}
                    fill={bookmarkedIds.has(course.id) ? '#3b82f6' : 'none'}
                    color="#3b82f6"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
