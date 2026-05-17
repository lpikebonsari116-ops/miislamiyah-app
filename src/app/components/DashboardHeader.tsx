import React from 'react';
import AppImage from '@/components/ui/AppImage';

export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <AppImage
            src="/assets/images/Logo_MI_format_Baru_-1778584431799.png"
            alt="Logo MI Islamiyah Malang - Institusi pendidikan Islam di Kebonsari Malang"
            width={36}
            height={36}
            className="rounded-lg object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Dashboard LMS
            </h1>
            <p className="text-sm text-muted-foreground">
              MI Islamiyah Malang — Tahun Ajaran 2025/2026
            </p>
          </div>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
        style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(22,163,74,0.2)' }}>
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Data diperbarui: Selasa, 12 Mei 2026 — 11:29
      </div>
    </div>
  );
}