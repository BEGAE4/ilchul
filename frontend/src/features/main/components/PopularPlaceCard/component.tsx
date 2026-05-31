'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import type { PopularPlaceCardProps } from './types';
import styles from './styles.module.scss';

export function PopularPlaceCard({ place, onClick }: PopularPlaceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.card} group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform`}
    >
      <div className="relative h-32 overflow-hidden">
        <Image
          src={place.image}
          alt={place.name}
          fill
          sizes="(max-width: 480px) 50vw, 200px"
          className="object-cover transition-transform group-hover:scale-110 duration-500"
        />
        <div className="absolute top-2 left-2 min-w-5 h-5 px-1 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-bold">
          {place.ranking}
        </div>
      </div>
      <div className="p-3">
        <div className="text-[10px] font-bold text-sky-600 mb-0.5">
          {place.category}
        </div>
        <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1">
          {place.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 truncate">{place.location}</span>
          <div className="flex items-center gap-0.5 text-xs text-gray-400 shrink-0">
            <Heart size={10} /> {place.likes.toLocaleString()}
          </div>
        </div>
      </div>
    </button>
  );
}
