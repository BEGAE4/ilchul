'use client';

import React, { useState } from 'react';
import AdminHeader from '../AdminHeader';
import AdminSidebar from '../AdminSidebar';
import styles from './styles.module.scss';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={`${styles.shell} min-h-screen bg-gray-50`}>
      <AdminHeader onMenuClick={() => setDrawerOpen(true)} />
      <AdminSidebar drawerOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="pt-14 md:pl-60">
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
