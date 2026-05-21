'use client';

import Image from 'next/image';
import { Heart, MapPin } from 'lucide-react';
import type { PopularPlanCardProps } from './types';
import styles from './styles.module.scss';

export function PopularPlanCard({ plan, onClick }: PopularPlanCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.card} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex h-28 active:scale-[0.98] transition-transform`}
    >
      <div className="relative w-28 shrink-0">
        <Image
          src={plan.thumbnail}
          alt={plan.title}
          fill
          sizes="112px"
          className="object-cover"
        />
        <div className="absolute top-2 left-2 min-w-6 h-6 px-1 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded text-xs text-white font-bold italic border border-white/20">
          {plan.ranking}
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">
            {plan.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">{plan.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400 min-w-0">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{plan.location}</span>
            <span className="w-0.5 h-2.5 bg-gray-200 mx-1 shrink-0" />
            <span className="shrink-0">{plan.duration}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Heart size={10} className="text-red-400 fill-red-400" />
            <span className="text-xs font-bold text-gray-600">{plan.likes}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
