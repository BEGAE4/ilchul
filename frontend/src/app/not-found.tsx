'use client';

import { useRouter } from 'next/navigation';
import { Home, Search, ArrowLeft, MapPinOff } from 'lucide-react';
import { motion } from 'motion/react';
import PageLayout from '@/shared/ui/PageLayout';

export default function NotFound() {
  const router = useRouter();

  return (
    <PageLayout>
    <div className="flex flex-col min-h-screen bg-white relative overflow-hidden">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-blue-50/50 to-white" />

      {/* 콘텐츠 */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mb-8 border-2 border-sky-100"
        >
          <MapPinOff size={48} className="text-sky-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-6xl font-bold text-sky-500 mb-2">404</h1>
          <h2 className="text-xl font-bold text-gray-900 mb-3">길을 잃으셨나요?</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-10">
            찾으시는 페이지가 존재하지 않거나
            <br />
            이동되었을 수 있어요.
            <br />
            <span className="text-sky-500 font-medium">새로운 여행을 시작해보는 건 어떨까요?</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xs space-y-3"
        >
          <button
            onClick={() => router.push('/')}
            className="w-full bg-sky-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Home size={18} />
            홈으로 돌아가기
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={16} />
              이전 페이지
            </button>
            <button
              onClick={() => router.push('/search')}
              className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
            >
              <Search size={16} />
              검색하기
            </button>
          </div>
        </motion.div>
      </div>
    </div>
    </PageLayout>
  );
}
