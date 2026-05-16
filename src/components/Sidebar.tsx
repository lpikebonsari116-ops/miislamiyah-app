'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import AppImage from '@/components/ui/AppImage';
import { LayoutDashboard, Users, GraduationCap, School, Star, BookOpen, CalendarDays, ClipboardList, BarChart3, ChevronLeft, ChevronRight, LogOut, ShieldCheck, Clock, BookOpenCheck, Stars, Library, Wind, Waves, } from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { toast } from 'sonner';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  roles?: string[];
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    section: 'Utama',
    items: [
      { href: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['admin', 'guru', 'murid'] },
    ],
  },
  {
    section: 'Ibadah',
    items: [
      { href: '/jadwal-sholat', label: 'Jadwal Sholat', icon: <Clock size={18} />, roles: ['admin', 'guru', 'murid'] },
      { href: '/doa-harian', label: 'Doa Harian', icon: <BookOpenCheck size={18} />, roles: ['admin', 'guru', 'murid'] },
      { href: '/asmaul-husna', label: 'Asmaul Husna', icon: <Stars size={18} />, roles: ['admin', 'guru', 'murid'] },
      { href: '/aqidatul-awam', label: 'Aqidatul Awam', icon: <Library size={18} />, roles: ['admin', 'guru', 'murid'] },
      { href: '/tahlil', label: 'Tahlil', icon: <Wind size={18} />, roles: ['admin', 'guru', 'murid'] },
      { href: '/istighotsah', label: 'Istighotsah', icon: <Waves size={18} />, roles: ['admin', 'guru', 'murid'] },
    ],
  },
  {
    section: 'Data Sekolah',
    items: [
      { href: '/student-management', label: 'Data Siswa', icon: <GraduationCap size={18} />, roles: ['admin', 'guru'] },
      { href: '/user-management', label: 'Pengguna', icon: <Users size={18} />, roles: ['admin'] },
      { href: '/kelas', label: 'Manajemen Kelas', icon: <School size={18} />, roles: ['admin', 'guru'] },
      { href: '/jadwal', label: 'Jadwal Pelajaran', icon: <CalendarDays size={18} />, roles: ['admin', 'guru', 'murid'] },
    ],
  },
  {
    section: 'Poin & Perilaku',
    items: [
      { href: '/poin-perilaku', label: 'Input Poin', icon: <Star size={18} />, badge: 3, roles: ['admin', 'guru'] },
      { href: '/life-skills', label: 'Life Skills Harian', icon: <BookOpen size={18} />, roles: ['admin', 'guru', 'murid'] },
      { href: '/absensi', label: 'Absensi', icon: <ClipboardList size={18} />, roles: ['admin', 'guru'] },
    ],
  },
  {
    section: 'Laporan',
    items: [
      { href: '/laporan', label: 'Laporan & Rekap', icon: <BarChart3 size={18} />, roles: ['admin', 'guru'] },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const roleColors: Record<string, string> = {
  admin: '#ef4444',
  guru: '#3b82f6',
  murid: '#10b981',
};

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logout berhasil');
    router.push('/login');
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <aside
      className="flex flex-col h-full transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? '64px' : '256px',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        flexShrink: 0,
      }}
    >
      {/* Logo Area */}
      <div
        className="flex items-center justify-between px-3 py-4"
        style={{ borderBottom: '1px solid var(--sidebar-border)', minHeight: '72px' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <AppImage
              src="/assets/images/Logo_SUKMA_1_-1778584431642.png"
              alt="Logo LMS - MI Islamiyah Malang"
              width={40}
              height={40}
              className="rounded-lg flex-shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">LMS</p>
              <p className="text-xs leading-tight truncate" style={{ color: 'var(--sidebar-muted)' }}>
                Sekolah Para Juara
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center w-full">
            <AppImage
              src="/assets/images/Logo_SUKMA_1_-1778584431642.png"
              alt="Logo LMS"
              width={32}
              height={32}
              className="rounded-md object-contain"
            />
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 hover:bg-white/10"
          style={{ color: 'var(--sidebar-muted)' }}
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* MI Islamiyah Logo strip */}
      {!collapsed && (
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ borderBottom: '1px solid var(--sidebar-border)', backgroundColor: 'rgba(255,255,255,0.04)' }}
        >
          <AppImage
            src="/assets/images/Logo_MI_format_Baru_-1778584431799.png"
            alt="Logo MI Islamiyah Malang"
            width={28}
            height={28}
            className="rounded object-contain flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--sidebar-fg)' }}>
              MI Islamiyah Malang
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--sidebar-muted)', fontSize: '0.625rem' }}>
              Kebonsari, Malang
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => !item.roles || item.roles.includes(user.role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={`section-${section.section}`}>
              {!collapsed && (
                <p className="sidebar-section-label">{section.section}</p>
              )}
              {collapsed && <div className="mt-3" />}
              {visibleItems.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={`nav-${item.href}`}
                    href={item.href}
                    className={`sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span
                            className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: 'var(--accent)', color: '#fff', fontSize: '0.625rem' }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom: User + Logout */}
      <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: '0.75rem 0.5rem' }}>
        {!collapsed ? (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
              style={{ backgroundColor: roleColors[user.role] || 'var(--accent)' }}
            >
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-white">{user.name}</p>
              <p className="text-xs truncate flex items-center gap-1" style={{ color: 'var(--sidebar-muted)' }}>
                <ShieldCheck size={10} />
                {user.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex-shrink-0 transition-colors duration-150 hover:text-red-400"
              style={{ color: 'var(--sidebar-muted)' }}
              title="Keluar dari sistem"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150 hover:text-red-400"
              style={{ color: 'var(--sidebar-muted)' }}
              title="Keluar dari sistem"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}