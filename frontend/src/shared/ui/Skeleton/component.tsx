'use client';

import styles from './styles.module.scss';

interface SkeletonProps {
  variant?: 'card' | 'text' | 'image' | 'circle';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ variant = 'text', width, height, className = '' }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.cardWrapper}>
      <Skeleton variant="image" height={160} />
      <div className={styles.cardContent}>
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={14} width="70%" />
        <Skeleton variant="text" height={14} width="50%" />
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="px-4 space-y-6 pt-4">
      {/* 배너 스켈레톤 */}
      <Skeleton variant="image" height={180} className="rounded-2xl" />

      {/* 섹션 헤더 */}
      <div className="space-y-3">
        <Skeleton variant="text" height={20} width="40%" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shrink-0 w-36">
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>

      {/* 두 번째 섹션 */}
      <div className="space-y-3">
        <Skeleton variant="text" height={20} width="50%" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton variant="image" width={80} height={80} className="rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton variant="text" height={16} width="80%" />
                <Skeleton variant="text" height={12} width="60%" />
                <Skeleton variant="text" height={12} width="40%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="bg-gray-200 animate-pulse h-64 w-full" />
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="w-24 h-4 bg-gray-200 animate-pulse rounded" />
          <div className="w-16 h-3 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 p-3 rounded-lg flex flex-col items-center gap-2">
            <div className="w-10 h-3 bg-gray-200 animate-pulse rounded" />
            <div className="w-14 h-5 bg-gray-200 animate-pulse rounded" />
          </div>
        ))}
      </div>
      <div className="px-5 space-y-3">
        <div className="w-full h-4 bg-gray-200 animate-pulse rounded" />
        <div className="w-4/5 h-4 bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="px-5 mt-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full shrink-0 mt-1" />
            <div className="flex-1 space-y-2">
              <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
              <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded" />
              <div className="w-full h-16 bg-gray-200 animate-pulse rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="px-4 space-y-4 pt-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton variant="image" width={72} height={72} className="rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton variant="text" height={16} width="75%" />
            <Skeleton variant="text" height={12} width="55%" />
            <Skeleton variant="text" height={12} width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}
