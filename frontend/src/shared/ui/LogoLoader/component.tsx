'use client';

import { motion } from 'motion/react';

interface LogoLoaderProps {
  message?: string;
}

export function LogoLoader({ message = '코스를 생성하고 있어요...' }: LogoLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* 로고 애니메이션 */}
      <div className="relative w-24 h-24">
        {/* 배경 원형 펄스 */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full bg-white/20"
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* 중앙 로고 원 */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white flex items-center justify-center shadow-lg"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* 일출 텍스트 로고 */}
          <div className="text-center">
            <div className="text-orange-500 font-black text-xl leading-tight">일출</div>
            <div className="text-orange-300 font-medium text-[8px] tracking-widest">ILCHUL</div>
          </div>
        </motion.div>
      </div>

      {/* 도트 로딩 인디케이터 */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/70"
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* 메시지 */}
      <motion.p
        className="text-white/90 text-sm font-medium text-center px-6"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
}
