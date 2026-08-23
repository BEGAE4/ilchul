'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/shared/ui/SafeImage';
import { Search, X, MapPin, Heart, Flame, ArrowRight, Clock as ClockIcon, TrendingUp } from 'lucide-react';
import {
  fetchRecentSearches,
  addRecentSearch,
  deleteRecentSearches,
  fetchAutocomplete,
  fetchPopularKeywords,
} from '@/features/search/api/search.api';
import type { PopularSearchKeyword, RecentSearch } from '@/features/search/types/search.types';
import { useNationwidePopularPlaces, useNationwidePopularPlans } from '@/features/main/hooks';

const MAX_RECENT = 8;
const TRENDING_LIMIT = 5;

interface Suggestion {
  type: 'place' | 'keyword';
  id: string;
  label: string;
  sub: string;
  placeId?: number;
}

function isPlaceSuggestion(type: string): boolean {
  return type.toLowerCase() === 'place';
}

export const SearchPage: React.FC = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAutocompleting, setIsAutocompleting] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autocompleteReqId = useRef(0);
  const [popularKeywords, setPopularKeywords] = useState<PopularSearchKeyword[]>([]);

  // 지금 뜨는 여행지 / 플랜 — 전국 인기 API (MAIN-60 / MAIN-58)
  const { items: trendingPlaces } = useNationwidePopularPlaces({ limit: TRENDING_LIMIT });
  const { items: trendingCourses } = useNationwidePopularPlans({ limit: TRENDING_LIMIT });

  const loadRecentSearches = useCallback(async () => {
    try {
      const data = await fetchRecentSearches();
      setRecentSearches(data.slice(0, MAX_RECENT));
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  // 인기 검색어 — GET /api/search/popular
  useEffect(() => {
    fetchPopularKeywords()
      .then((data) => setPopularKeywords(data.slice(0, 10)))
      .catch(() => setPopularKeywords([]));
  }, []);

  // 자동완성 — GET /api/search/autocomplete
  const buildSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsAutocompleting(false);
      return;
    }
    const reqId = ++autocompleteReqId.current;
    setIsAutocompleting(true);
    try {
      const items = await fetchAutocomplete(query.trim(), 8);
      if (reqId !== autocompleteReqId.current) return;
      setSuggestions(
        items.map((item, idx) => {
          const isPlace = isPlaceSuggestion(item.type) && item.placeId != null;
          return {
            type: isPlace ? 'place' : 'keyword',
            id: `${item.type}-${item.placeId ?? idx}-${item.keyword}`,
            label: item.keyword,
            sub: isPlace ? '장소' : '검색어',
            placeId: isPlace ? (item.placeId as number) : undefined,
          };
        })
      );
    } catch {
      if (reqId === autocompleteReqId.current) setSuggestions([]);
    } finally {
      if (reqId === autocompleteReqId.current) setIsAutocompleting(false);
    }
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
    const trimmed = query.trim();
    addRecentSearch(trimmed)
      .then(loadRecentSearches)
      .catch(() => {});
    setSuggestions([]);
    setInputValue('');
    router.push(`/search/results?q=${encodeURIComponent(trimmed)}`);
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

  const handlePlaceClick = (placeId: string | number) => {
    router.push(`/place/${placeId}`);
  };

  const handleCourseClick = (courseId: string | number) => {
    router.push(`/course/${courseId}`);
  };

  const placeSuggestions = suggestions.filter((s) => s.type === 'place');
  const keywordSuggestions = suggestions.filter((s) => s.type === 'keyword');
  const showDropdown = isFocused && inputValue.trim().length > 0;
  const showRecent = isFocused && inputValue.trim().length === 0 && recentSearches.length > 0;

  return (
    <div className="relative flex-1 p-5 pb-24">
      {/* 검색창 */}
      <form onSubmit={handleSearchSubmit} className="relative mb-6">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="장소, 플랜, 지역명 검색"
          className="w-full bg-gray-100 border-none rounded-2xl py-4 pl-12 pr-10 text-base text-gray-900 font-medium focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm"
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
                      onClick={() => handlePlaceClick(item.placeId ?? item.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-[11px] text-gray-400">{item.sub}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* 검색어 그룹 */}
              {keywordSuggestions.length > 0 && (
                <>
                  <div className={`px-4 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider ${placeSuggestions.length > 0 ? 'border-t' : ''}`}>검색어</div>
                  {keywordSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSearch(item.label)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Search size={14} className="text-gray-500" />
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
                deleteRecentSearches(recentSearches)
                  .then(() => setRecentSearches([]))
                  .catch(() => {});
              }}
              className="text-[11px] text-gray-400 active:text-gray-600"
            >
              전체 삭제
            </button>
          </div>
          {recentSearches.map((item) => (
            <div
              key={`${item.name}-${item.createdAt}`}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition"
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSearch(item.name)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <ClockIcon size={14} className="text-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item.name}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 인기 검색어 */}
      {popularKeywords.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-primary-500" />
            <h2 className="font-bold text-gray-900">인기 검색어</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularKeywords.map((item) => (
              <button
                key={`${item.ranking}-${item.keyword}`}
                type="button"
                onClick={() => handleSearch(item.keyword)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 transition active:scale-95"
              >
                <span className="text-[11px] font-bold text-primary-500">{item.ranking}</span>
                {item.keyword}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 지금 뜨는 여행지 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-accent-500" />
          <h2 className="font-bold text-gray-900">지금 뜨는 여행지</h2>
        </div>
        <div className="space-y-2.5">
          {trendingPlaces.map((place, idx) => (
            <button
              key={place.id}
              onClick={() => handlePlaceClick(place.id)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition active:scale-[0.98]"
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                idx < 3 ? 'bg-accent-500 text-white' : 'bg-gray-100 text-gray-500'
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
              <span className="text-[11px] text-gray-400">{(place.likes ?? 0).toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 지금 뜨는 플랜 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-primary-500" />
          <h2 className="font-bold text-gray-900">지금 뜨는 플랜</h2>
        </div>
        <div className="space-y-2.5">
          {trendingCourses.map((course, idx) => (
            <button
              key={course.id}
              onClick={() => handleCourseClick(course.id)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition active:scale-[0.98]"
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                idx < 3 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {idx + 1}
              </span>
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={course.thumbnail} alt={course.title} fill sizes="40px" className="object-cover" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold line-clamp-1">{course.title}</p>
                <p className="text-[11px] text-gray-400">
                  {course.location} · {course.duration}
                </p>
              </div>
              <Heart size={12} className="text-gray-300 fill-gray-300" />
              <span className="text-[11px] text-gray-400">{(course.likes ?? 0).toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
