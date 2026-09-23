'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { LogIn, X } from 'lucide-react';
import { saveLoginReturnTo } from '@/shared/lib/auth/loginReturnTo';
import {
  DEFAULT_LOGIN_PROMPT_MESSAGE,
  useLoginPromptStore,
} from '@/shared/lib/stores/useLoginPromptStore';

// 로그인 유도 모달. 앱에 한 번만 마운트하고 useLoginPromptStore.show() 로 연다.
// 비로그인 사용자가 댓글·좋아요·담기 등 로그인이 필요한 기능을 눌렀을 때 화면을 옮기지 않고
// 그 자리에서 로그인을 안내한다. "나중에" 를 누르면 보던 화면이 그대로 남는다.
export function LoginPromptModal() {
  const router = useRouter();
  const pathname = usePathname();
  const isOpen = useLoginPromptStore((s) => s.isOpen);
  const message = useLoginPromptStore((s) => s.message);
  const returnTo = useLoginPromptStore((s) => s.returnTo);
  const hide = useLoginPromptStore((s) => s.hide);

  // 라우트가 바뀌면 닫는다 (뒤로가기 등으로 화면이 바뀌었는데 모달만 남지 않게)
  useEffect(() => {
    hide();
  }, [pathname, hide]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const goLogin = () => {
    saveLoginReturnTo(returnTo ?? pathname);
    hide();
    router.push('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-y-0 app-frame z-[130] flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-prompt-title"
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={hide}
          />
          <motion.div
            className="relative w-full max-w-xs bg-white rounded-2xl p-6 shadow-xl text-center"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              onClick={hide}
              className="absolute top-3 right-3 p-1.5 text-gray-400 active:text-gray-600 rounded-full"
              aria-label="닫기"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
              <LogIn size={22} />
            </div>
            <p id="login-prompt-title" className="text-base font-bold text-gray-900 mb-1">
              로그인이 필요해요
            </p>
            <p className="text-sm text-gray-500 mb-5">{message ?? DEFAULT_LOGIN_PROMPT_MESSAGE}</p>
            <button
              type="button"
              onClick={goLogin}
              className="w-full py-3 bg-primary-500 text-white text-sm font-bold rounded-xl active:scale-[0.98] transition-transform"
            >
              로그인하러 가기
            </button>
            <button
              type="button"
              onClick={hide}
              className="w-full py-2.5 mt-1 text-sm font-bold text-gray-400 active:text-gray-600"
            >
              나중에 할게요
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
