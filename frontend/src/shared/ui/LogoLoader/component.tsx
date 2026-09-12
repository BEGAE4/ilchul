'use client';

import { motion, useReducedMotion } from 'motion/react';

interface LogoLoaderProps {
  /** 로더 하단에 노출할 문구. 생략하면 스크린리더 전용 안내만 제공한다. */
  message?: string;
}

/** 해가 한 번 떠올랐다 가라앉는 주기(초). 빛무리도 같은 주기로 돈다. */
const CYCLE = 3.6;
/** 빛무리 3개를 주기의 1/3 간격으로 흘려 보낸다 */
const HALO_DELAYS = [0, CYCLE / 3, (CYCLE * 2) / 3];

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
        {/*
          해와 빛무리를 한 묶음으로 띄운다. 이전에는 해만 위아래로 움직이고 빛무리는 제자리라
          둘의 중심이 최대 10px 어긋났고, 주기도 달라(3s / 2.7s) 관계가 계속 바뀌어 흔들려 보였다.
        */}
        <motion.div
          className="absolute bottom-1 left-1/2 h-16 w-16 -translate-x-1/2"
          animate={shouldReduceMotion ? undefined : { y: [10, 0, 10] }}
          transition={{ duration: CYCLE, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/*
            퍼져나가는 빛무리 — 투명하게 시작해 잠깐 차올랐다 다시 투명해진다.
            이전에는 opacity 0.5 → 0 으로 끝나 루프가 다시 시작될 때 한 프레임에 0 → 0.5 로
            번쩍였고, 지연 중인 빛무리는 initial 이 없어 미리 보이다가 튀었다.
          */}
          {(shouldReduceMotion ? [0] : HALO_DELAYS).map((delay) => (
            <motion.div
              key={delay}
              className="absolute inset-0 rounded-full bg-accent-300/40"
              initial={shouldReduceMotion ? false : { scale: 1, opacity: 0 }}
              animate={
                shouldReduceMotion
                  ? { scale: 1.4, opacity: 0.5 }
                  : { scale: [1, 2.2], opacity: [0, 0.5, 0] }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: CYCLE,
                      repeat: Infinity,
                      delay,
                      ease: 'easeOut',
                      opacity: { duration: CYCLE, repeat: Infinity, delay, times: [0, 0.2, 1], ease: 'easeInOut' },
                    }
              }
            />
          ))}

          {/* 떠오르는 해 */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-b from-accent-300 to-accent-500 shadow-[0_0_36px_10px_var(--color-accent-200)]"
            animate={shouldReduceMotion ? undefined : { scale: [0.96, 1, 0.96] }}
            transition={{ duration: CYCLE, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

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
