'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, MapPin, Heart, Flame, ArrowRight, Route, Clock as ClockIcon } from 'lucide-react';
import {
  MOCK_COURSES,
  NATIONWIDE_COURSES,
  NEARBY_POPULAR_PLACES,
  NATIONWIDE_PLACES,
} from '@/shared/data/mockData';

const RECENT_SEARCHES_KEY = 'ilchul_recent_searches';
const MAX_RECENT = 8;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const prev = getRecentSearches().filter((q) => q !== query);
  const next = [query, ...prev].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
}

// 트렌딩 데이터 (likes 기준 정렬)
const ALL_PLACES = [...NEARBY_POPULAR_PLACES, ...NATIONWIDE_PLACES];
const uniquePlaces = ALL_PLACES.filter(
  (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
);
const TRENDING_PLACES = [...uniquePlaces].sort((a, b) => b.likes - a.likes).slice(0, 5);

const ALL_COURSES = [...MOCK_COURSES, ...NATIONWIDE_COURSES];
const TRENDING_COURSES = [...ALL_COURSES].sort((a, b) => b.likes - a.likes).slice(0, 5);

interface Suggestion {
  type: 'course' | 'place';
  id: string;
  label: string;
  sub: string;
}

export const SearchPage: React.FC = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAutocompleting, setIsAutocompleting] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const buildSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsAutocompleting(false);
      return;
    }
    setIsAutocompleting(true);
    const q = query.toLowerCase();

    const placeSuggestions: Suggestion[] = uniquePlaces
      .filter((p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q))
      .slice(0, 3)
      .map((p) => ({ type: 'place', id: p.id, label: p.name, sub: `${p.category} · ${p.location}` }));

    const courseSuggestions: Suggestion[] = ALL_COURSES
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 3)
      .map((c) => ({ type: 'course', id: c.id, label: c.title, sub: `${c.stops.length}개 정거장 · ${c.author}` }));

    setSuggestions([...placeSuggestions, ...courseSuggestions]);
    setIsAutocompleting(false);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      buildSuggestions(value);
    }, 200);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    saveRecentSearch(query.trim());
    setRecentSearches(getRecentSearches());
    setSuggestions([]);
    setInputValue('');
    router.push(`/search/results?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) handleSearch(inputValue);
  };

  const clearInput = () => {
    setInputValue('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handlePlaceClick = (placeId: string) => {
    router.push(`/place/${placeId}`);
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  const placeSuggestions = suggestions.filter((s) => s.type === 'place');
  const courseSuggestions = suggestions.filter((s) => s.type === 'course');
  const showDropdown = isFocused && inputValue.trim().length > 0;
  const showRecent = isFocused && inputValue.trim().length === 0 && recentSearches.length > 0;

  return (
    <div className="relative p-5 pb-24">
      {/* 검색창 */}
      <form onSubmit={handleSearchSubmit} className="relative mb-6">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="장소, 코스, 지역명 검색"
          className="w-full bg-gray-100 border-none rounded-2xl py-4 pl-12 pr-10 text-base text-gray-900 font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all shadow-sm"
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 active:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {/* 자동완성 드롭다운 */}
      {showDropdown && (
        <div
          className="absolute left-5 right-5 top-[88px] z-20 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[60vh] overflow-y-auto"
          onMouseDown={(e) => e.preventDefault()}
        >
          {isAutocompleting ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">검색 중...</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">검색 결과가 없어요</div>
          ) : (
            <>
              {/* 장소 그룹 */}
              {placeSuggestions.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">장소</div>
                  {placeSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handlePlaceClick(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-sky-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-[11px] text-gray-400">{item.sub}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* 코스 그룹 */}
              {courseSuggestions.length > 0 && (
                <>
                  <div className={`px-4 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider ${placeSuggestions.length > 0 ? 'border-t' : ''}`}>코스</div>
                  {courseSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleCourseClick(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <Route size={14} className="text-violet-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-[11px] text-gray-400">{item.sub}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* 전체 검색 */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSearch(inputValue)}
                className="w-full flex items-center justify-between px-4 py-3 border-t bg-gray-50 hover:bg-gray-100 transition"
              >
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Search size={14} /> &ldquo;{inputValue}&rdquo; 전체 검색
                </span>
                <ArrowRight size={14} className="text-gray-400" />
              </button>
            </>
          )}
        </div>
      )}

      {/* 최근 검색어 (포커스 시 드롭다운) */}
      {showRecent && (
        <div
          className="absolute left-5 right-5 top-[88px] z-20 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="px-4 pt-3 pb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">최근 검색</span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                localStorage.removeItem(RECENT_SEARCHES_KEY);
                setRecentSearches([]);
              }}
              className="text-[11px] text-gray-400 active:text-gray-600"
            >
              전체 삭제
            </button>
          </div>
          {recentSearches.map((keyword) => (
            <div
              key={keyword}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition"
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSearch(keyword)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <ClockIcon size={14} className="text-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-700">{keyword}</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const next = recentSearches.filter((q) => q !== keyword);
                  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
                  setRecentSearches(next);
                }}
                className="p-1 text-gray-300 active:text-gray-500"
                aria-label={`${keyword} 삭제`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 지금 뜨는 여행지 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-orange-500" />
          <h2 className="font-bold text-gray-900">지금 뜨는 여행지</h2>
        </div>
        <div className="space-y-2.5">
          {TRENDING_PLACES.map((place, idx) => (
            <button
              key={place.id}
              onClick={() => handlePlaceClick(place.id)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition active:scale-[0.98]"
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                idx < 3 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {idx + 1}
              </span>
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={place.image} alt={place.name} fill sizes="40px" className="object-cover" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold">{place.name}</p>
                <p className="text-[11px] text-gray-400">{place.category} · {place.location}</p>
              </div>
              <Heart size={12} className="text-gray-300 fill-gray-300" />
              <span className="text-[11px] text-gray-400">{place.likes.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 지금 뜨는 코스 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-violet-500" />
          <h2 className="font-bold text-gray-900">지금 뜨는 코스</h2>
        </div>
        <div className="space-y-2.5">
          {TRENDING_COURSES.map((course, idx) => (
            <button
              key={course.id}
              onClick={() => handleCourseClick(course.id)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition active:scale-[0.98]"
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                idx < 3 ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {idx + 1}
              </span>
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={course.thumbnail} alt={course.title} fill sizes="40px" className="object-cover" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold line-clamp-1">{course.title}</p>
                <p className="text-[11px] text-gray-400">
                  {course.location} · {course.duration} · {course.stops.length}곳
                </p>
              </div>
              <Heart size={12} className="text-gray-300 fill-gray-300" />
              <span className="text-[11px] text-gray-400">{course.likes.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
