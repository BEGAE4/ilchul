'use client';

import React from 'react';
import { MapPin, Clock, Heart, BadgeCheck } from 'lucide-react';
import type { Course } from '@/shared/data/mockData';

interface CourseCardProps {
  course: Course;
  onClick: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
      onClick={() => onClick(course.id)}
    >
      <div className="relative h-40 w-full">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {course.isVerified && (
          <div className="absolute top-2 left-2 bg-blue-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <BadgeCheck size={12} className="fill-white text-blue-500" />
            <span>인증된 코스</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Heart size={12} className="fill-white" />
          <span>{course.likes}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 flex-1 mr-2">
            {course.title}
          </h3>
          <div className="flex items-center text-blue-500 font-semibold text-sm shrink-0">
            <Heart size={14} className="fill-blue-100 text-blue-400 mr-1" />
            {course.bookmarks}
          </div>
        </div>

        <p className="text-gray-500 text-sm line-clamp-1 mb-3">
          {course.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{course.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{course.duration}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {course.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
