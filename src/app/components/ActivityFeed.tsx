'use client';

import React from 'react';
import { Star, MinusCircle, Clock } from 'lucide-react';

const activities = [
  {
    id: 'act-001',
    type: 'kebaikan',
    guru: 'Ibu Sari Dewi',
    siswa: 'Muhammad Hafidz',
    kelas: '4A',
    aksi: 'Rajin sholat dan beribadah',
    poin: '+5',
    time: '10 menit lalu',
  },
  {
    id: 'act-002',
    type: 'keburukan',
    guru: 'Pak Budi Santoso',
    siswa: 'Farhan Ardiansyah',
    kelas: '5B',
    aksi: 'Membuat kegaduhan saat di aula',
    poin: '-20',
    time: '25 menit lalu',
  },
  {
    id: 'act-003',
    type: 'kebaikan',
    guru: 'Ibu Nurul Hidayah',
    siswa: 'Aulia Rahmadani',
    kelas: '3A',
    aksi: 'Disiplin datang tepat waktu',
    poin: '+5',
    time: '42 menit lalu',
  },
  {
    id: 'act-004',
    type: 'keburukan',
    guru: 'Pak Agus Wahyudi',
    siswa: 'Bagas Wicaksono',
    kelas: '4A',
    aksi: 'Berlari di koridor',
    poin: '-30',
    time: '1 jam lalu',
  },
  {
    id: 'act-005',
    type: 'kebaikan',
    guru: 'Ibu Fatimah Zahra',
    siswa: 'Zahra Putri Andini',
    kelas: '6A',
    aksi: 'Menghormati orang tua dan guru',
    poin: '+5',
    time: '1.5 jam lalu',
  },
  {
    id: 'act-006',
    type: 'kebaikan',
    guru: 'Ibu Sari Dewi',
    siswa: 'Ilham Ramadhan',
    kelas: '4A',
    aksi: 'Suka menolong teman',
    poin: '+5',
    time: '2 jam lalu',
  },
];

export default function ActivityFeed() {
  return (
    <div className="card-elevated rounded-xl overflow-hidden h-full">
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Clock size={16} style={{ color: 'var(--primary)' }} />
          <h2 className="text-sm font-semibold">Aktivitas Poin Terbaru</h2>
        </div>
        <span className="text-xs text-muted-foreground">Hari ini</span>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {activities.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                backgroundColor: a.type === 'kebaikan' ? 'var(--success-bg)' : 'var(--danger-bg)',
              }}
            >
              {a.type === 'kebaikan' ? (
                <Star size={13} style={{ color: 'var(--success)' }} />
              ) : (
                <MinusCircle size={13} style={{ color: 'var(--danger)' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold truncate">{a.siswa}</p>
                <span
                  className="text-xs font-bold font-tabular flex-shrink-0"
                  style={{ color: a.type === 'kebaikan' ? 'var(--success)' : 'var(--danger)' }}
                >
                  {a.poin}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{a.aksi}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontSize: '0.625rem' }}>
                {a.guru} · Kelas {a.kelas} · {a.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          className="w-full text-xs font-semibold py-2 rounded-lg transition-colors hover:bg-muted"
          style={{ color: 'var(--primary)' }}
        >
          Lihat semua aktivitas
        </button>
      </div>
    </div>
  );
}
