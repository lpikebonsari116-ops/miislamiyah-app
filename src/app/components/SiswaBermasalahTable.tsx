'use client';

import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

const siswaBermasalah = [
  { id: 'siswa-b01', nama: 'Farhan Ardiansyah', kelas: '5B', poin: 42, pelanggaran: 'Membuat kegaduhan saat sholat', tanggal: '10/05/2025' },
  { id: 'siswa-b02', nama: 'Bagas Wicaksono', kelas: '4A', poin: 47, pelanggaran: 'Berlari di koridor koridor', tanggal: '10/05/2025' },
  { id: 'siswa-b03', nama: 'Rizki Maulana', kelas: '3B', poin: 58, pelanggaran: 'Tidak mengerjakan PR', tanggal: '09/05/2025' },
  { id: 'siswa-b04', nama: 'Omar Faruq Habibie', kelas: '4A', poin: 62, pelanggaran: 'Terlambat masuk sekolah', tanggal: '09/05/2025' },
];

function getPoinColor(poin: number) {
  if (poin < 50) return 'var(--danger)';
  if (poin < 65) return 'var(--warning)';
  return 'var(--foreground)';
}

function getPoinBg(poin: number) {
  if (poin < 50) return 'var(--danger-bg)';
  if (poin < 65) return 'var(--warning-bg)';
  return 'var(--muted)';
}

export default function SiswaBermasalahTable() {
  return (
    <div className="card-elevated rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
          <h2 className="text-sm font-semibold">Siswa Perlu Perhatian</h2>
          <span className="badge-warning">4 siswa</span>
        </div>
        <button
          className="text-xs font-semibold flex items-center gap-1 hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          Lihat semua <ArrowRight size={12} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--muted)' }}>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground">Nama Siswa</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">Kelas</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">Poin</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">Pelanggaran Terakhir</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {siswaBermasalah.map((s, idx) => (
              <tr
                key={s.id}
                className="table-row-hover cursor-pointer transition-colors"
                style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}
              >
                <td className="px-5 py-3 font-medium text-sm">{s.nama}</td>
                <td className="px-3 py-3">
                  <span className="badge-siswa">Kelas {s.kelas}</span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold font-tabular"
                    style={{ backgroundColor: getPoinBg(s.poin), color: getPoinColor(s.poin) }}
                  >
                    {s.poin}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{s.pelanggaran}</td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{s.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
