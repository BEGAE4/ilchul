'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { Flag, MessageSquare, X } from 'lucide-react';

interface AdminSidebarProps {
  drawerOpen: boolean;
  onClose: () => void;
}

type CountKey = 'reports' | 'inquiries';

interface MenuEntry {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  match: string;
  countKey: CountKey;
}

const MENU: MenuEntry[] = [
  { href: '/admin/reports', label: '신고', icon: Flag, match: '/admin/reports', countKey: 'reports' },
  { href: '/admin/inquiries', label: '문의', icon: MessageSquare, match: '/admin/inquiries', countKey: 'inquiries' },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ drawerOpen, onClose }) => {
  const pathname = usePathname();
  const [counts, setCounts] = useState<Record<CountKey, number>>({ reports: 0, inquiries: 0 });

  const fetchCounts = useCallback(async () => {
    try {
      const [r, i] = await Promise.all([
        axios.get('/api/admin/reports', { params: { status: 'PENDING', size: 1 } }),
        axios.get('/api/admin/inquiries', { params: { status: 'OPEN', size: 1 } }),
      ]);
      setCounts({
        reports: typeof r.data?.totalCount === 'number' ? r.data.totalCount : 0,
        inquiries: typeof i.data?.totalCount === 'number' ? i.data.totalCount : 0,
      });
    } catch {
      // 카운트 fetch 실패 시 배지를 0으로 유지
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [pathname, fetchCounts]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchCounts();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchCounts]);

  const renderMenu = (closeOnClick: boolean) =>
    MENU.map((item) => {
      const Icon = item.icon;
      const isActive = pathname?.startsWith(item.match) ?? false;
      const count = counts[item.countKey];
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={closeOnClick ? onClose : undefined}
          className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
            isActive
              ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Icon size={18} />
          <span className="flex-1">{item.label}</span>
          {count > 0 && (
            <span
              aria-label={`미처리 ${count}건`}
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-medium rounded tabular-nums ${
                isActive ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Link>
      );
    });

  return (
    <>
      <aside className="hidden md:block fixed top-14 left-0 bottom-0 z-20 w-60 border-r border-gray-200 bg-white">
        <nav className="py-4" aria-label="운영자 콘솔 메뉴">
          {renderMenu(false)}
        </nav>
      </aside>

      {drawerOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="fixed top-0 left-0 bottom-0 z-50 w-64 bg-white shadow-xl">
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-900">메뉴</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="메뉴 닫기"
                className="p-1 text-gray-700 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="py-4" aria-label="운영자 콘솔 메뉴">
              {renderMenu(true)}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
