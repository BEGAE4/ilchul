'use client';

import { motion, useReducedMotion } from 'motion/react';

interface LogoLoaderProps {
  /** 로더 하단에 노출할 문구. 생략하면 스크린리더 전용 안내만 제공한다. */
  message?: string;
}

/** 빛무리가 순차적으로 퍼지도록 하는 지연 값 */
const HALO_DELAYS = [0, 0.9, 1.8];

export function LogoLoader({ message }: LogoLoaderProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-5"
    >
      {/* 일출 모션: 수평선 위로 떠오르는 해 (landing 스텝과 동일한 모티프) */}
      <div className="relative h-28 w-40 overflow-hidden" aria-hidden>
        {/* 퍼져나가는 빛무리 */}
        {HALO_DELAYS.map((delay) => (
          <motion.div
            key={delay}
            className="absolute bottom-1 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-accent-300/40"
            animate={shouldReduceMotion ? undefined : { scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 2.7, repeat: Infinity, delay, ease: 'easeOut' }}
          />
        ))}

        {/* 떠오르는 해 */}
        <motion.div
          className="absolute bottom-1 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-gradient-to-b from-accent-300 to-accent-500 shadow-[0_0_36px_10px_var(--color-accent-200)]"
          animate={shouldReduceMotion ? undefined : { y: [10, 0, 10], scale: [0.96, 1, 0.96] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* 수평선 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
      </div>

      {/* 진행 인디케이터 */}
      <div className="relative h-1 w-28 overflow-hidden rounded-full bg-primary-100">
        <motion.div
          className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-primary-300 to-primary-500"
          initial={{ x: '-100%' }}
          animate={shouldReduceMotion ? { x: '100%' } : { x: ['-100%', '300%'] }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      </div>

      {message ? (
        <p className="px-6 text-center text-sm font-medium text-gray-500">{message}</p>
      ) : (
        <span className="sr-only">불러오는 중입니다. 잠시만 기다려주세요.</span>
      )}
    </div>
  );
}
