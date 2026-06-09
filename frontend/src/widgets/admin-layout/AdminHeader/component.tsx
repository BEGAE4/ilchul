'use client';

import React from 'react';
import { Menu } from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center px-4 md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 mr-1 text-gray-700 hover:text-gray-900"
        aria-label="메뉴 열기"
      >
        <Menu size={20} />
      </button>
      <h1 className="text-sm md:text-base font-semibold text-gray-900">
        일출 운영자 콘솔
      </h1>
      <div className="ml-auto flex items-center gap-3 text-xs text-gray-600">
        <span className="hidden sm:inline">관리자</span>
        <button
          type="button"
          className="hover:text-gray-900"
          onClick={() => {
            // P0: 로그아웃 동선은 별도 plan. 현재는 no-op.
          }}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
