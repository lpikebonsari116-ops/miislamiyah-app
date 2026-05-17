'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/app/AuthContext';
import { getStudentsList } from '@/utils/students';
import { Student } from '@/app/student-management/components/StudentManagementClient';
import {
  Calendar,
  TrendingUp,
  Award,
  BookOpen,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  PieChart
} from 'lucide-react';
import {
  getLifeSkillBySiswa,
  getLifeSkillRingkasan,
  getLifeSkillByTanggal,
  LifeSkillHarian
} from '@/utils/lifeSkill';
import {
  getKehadiranBySiswa,
  getPresentaseKehadiran
} from '@/utils/muridProfile';

export default function LaporanLifeSkillPage() {
  const { user } = useAuth();
  const [siswa, setSiswa] = useState<Student | null>(null);
  const [lifeSkillList, setLifeSkillList] = useState<LifeSkillHarian[]>([]);
  const [kehadiranList, setKehadiranList] = useState<any[]>([]);
  const [ringkasan, setRingkasan] = useState<any>(null);
  const [tanggalTerpilih, setTanggalTerpilih] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'hari' | 'ringkasan'>('ringkasan');

  useEffect(() => {
    const students = getStudentsList();
    let targetSiswa = null;
    
    if (user?.role === 'murid') {
      targetSiswa = students.find(s => 
        s.nama.toLowerCase().includes(user.username.toLowerCase()) || 
        s.nis === user.username);
    }

    if (targetSiswa) {
      setSiswa(targetSiswa);
      const ls = getLifeSkillBySiswa(targetSiswa.id);
      setLifeSkillList(ls);
      setRingkasan(getLifeSkillRingkasan(targetSiswa.id));
      setKehadiranList(getKehadiranBySiswa(targetSiswa.id));
      
      if (ls.length > 0) {
        const uniqueDates = [...new Set(ls.map(l => l.tanggal))].sort().reverse();
        if (uniqueDates.length > 0) {
          setTanggalTerpilih(uniqueDates[0]);
        }
      }
    }
  }, [user]);

  if (!siswa) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle size={40} className="mb-4" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Data siswa tidak ditemukan</p>
        </div>
      </AppLayout>
    );
  }

  const lifeSkillHariIni = getLifeSkillByTanggal(siswa.id, tanggalTerpilih);
  const uniqueDates = [...new Set(lifeSkillList.map(l => l.tanggal))].sort().reverse();
  const presentaseKehadiran = getPresentaseKehadiran(siswa.id);

  const getKategoriColor = (kategori: string) => {
    switch (kategori) {
      case 'Ibadah': return { bg: 'var(--success-bg)', color: 'var(--success)' };
      case 'Sosial': return { bg: 'var(--primary-light)', color: 'var(--primary)' };
      case 'Akademik': return { bg: 'var(--info-bg)', color: 'var(--info)' };
      case 'Kemandirian': return { bg: 'var(--warning-bg)', color: 'var(--warning)' };
      default: return { bg: 'var(--muted)', color: 'var(--muted-foreground)' };
    }
  };

  const getStarRating = (nilai: number) => {
    return '★'.repeat(nilai) + '☆'.repeat(5 - nilai);
  };

  const getTrendIcon = (tren: string) => {
    if (tren === 'Naik') return <TrendingUp size={16} className="text-green-500" />;
    if (tren === 'Turun') return <TrendingUp size={16} className="text-red-500" style={{ transform: 'rotate(180deg)' }} />;
    return <Clock size={16} className="text-yellow-500" />;
  };

  const gantiTanggal = (arah: 'sebelum' | 'sesudah') => {
    const index = uniqueDates.indexOf(tanggalTerpilih);
    if (arah === 'sebelum' && index < uniqueDates.length - 1) {
      setTanggalTerpilih(uniqueDates[index + 1]);
    } else if (arah === 'sesudah' && index > 0) {
      setTanggalTerpilih(uniqueDates[index - 1]);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Laporan Life Skill Harian</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {siswa.nama} - {siswa.kelas}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('ringkasan')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'ringkasan' 
                  ? 'btn-primary' 
                  : 'btn-secondary'
              }`}
            >
              <BarChart2 size={16} className="inline mr-1" /> Ringkasan
            </button>
            <button
              onClick={() => setViewMode('hari')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'hari' 
                  ? 'btn-primary' 
                  : 'btn-secondary'
              }`}
            >
              <Calendar size={16} className="inline mr-1" /> Harian
            </button>
          </div>
        </div>

        {viewMode === 'ringkasan' && ringkasan && (
          <>
            {/* Statistik Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-elevated p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={18} style={{ color: 'var(--success)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Rata-rata Nilai</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: 'var(--success)' }}>{ringkasan.rataRata}</p>
                <div className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
                  {getStarRating(Math.round(ringkasan.rataRata))}
                </div>
              </div>

              <div className="card-elevated p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={18} style={{ color: 'var(--primary)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Total Hari</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{ringkasan.totalHari}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Hari terpantau</p>
              </div>

              <div className="card-elevated p-5">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={18} style={{ color: 'var(--info)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Kategori Terbaik</span>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--info)' }}>{ringkasan.kategoriTerbaik}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Nilai tertinggi</p>
              </div>

              <div className="card-elevated p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} style={{ color: 'var(--warning)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Tren</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(ringkasan.trenTerakhir)}
                  <p className="text-lg font-bold" style={{ 
                    color: ringkasan.trenTerakhir === 'Naik' ? 'var(--success)' : 
                           ringkasan.trenTerakhir === 'Turun' ? 'var(--danger)' : 'var(--warning)'
                  }}>
                    {ringkasan.trenTerakhir}
                  </p>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>7 hari terakhir</p>
              </div>
            </div>

            {/* Kehadiran */}
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={18} style={{ color: 'var(--info)' }} />
                <h3 className="font-bold">Statistik Kehadiran</h3>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto" style={{ 
                    background: `conic-gradient(var(--success) ${presentaseKehadiran}%, var(--muted) 0)`,
                    position: 'relative'
                  }}>
                    <div className="w-18 h-18 rounded-full bg-white flex items-center justify-center absolute" style={{ width: '70%', height: '70%' }}>
                      <span className="text-xl font-bold" style={{ color: 'var(--success)' }}>{presentaseKehadiran}%</span>
                    </div>
                  </div>
                  <p className="text-sm mt-2 font-semibold" style={{ color: 'var(--foreground)' }}>Kehadiran</p>
                </div>
                <div className="flex-1 space-y-2">
                  {['Hadir', 'Sakit', 'Izin', 'Alpha'].map(status => {
                    const count = kehadiranList.filter(k => k.status === status).length;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{status}</span>
                        <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{count} hari</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Life Skill Terbaru */}
            <div className="card-elevated overflow-hidden">
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                <div className="flex items-center gap-2">
                  <Star size={16} style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Life Skill Terbaru</span>
                </div>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {lifeSkillList.slice(0, 10).map(ls => {
                  const colors = getKategoriColor(ls.kategori);
                  return (
                    <div key={ls.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: colors.bg, color: colors.color }}>
                          {ls.kategori}
                        </span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{ls.skill}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{ls.tanggal} · {ls.keterangan}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: ls.nilai >= 4 ? 'var(--success)' : ls.nilai >= 3 ? 'var(--warning)' : 'var(--danger)' }}>
                          {getStarRating(ls.nilai)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {viewMode === 'hari' && (
          <>
            {/* Tanggal Picker */}
            <div className="card-elevated p-4 flex items-center justify-between">
              <button 
                onClick={() => gantiTanggal('sebelum')}
                disabled={!uniqueDates.length || uniqueDates.indexOf(tanggalTerpilih) === uniqueDates.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-center">
                <Calendar size={18} className="inline mr-2" style={{ color: 'var(--primary)' }} />
                <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>{tanggalTerpilih}</span>
              </div>
              <button 
                onClick={() => gantiTanggal('sesudah')}
                disabled={!uniqueDates.length || uniqueDates.indexOf(tanggalTerpilih) === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Life Skill Hari Ini */}
            {lifeSkillHariIni.length === 0 ? (
              <div className="card-elevated p-8 text-center">
                <Calendar size={40} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Belum ada life skill untuk tanggal ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lifeSkillHariIni.map(ls => {
                  const colors = getKategoriColor(ls.kategori);
                  return (
                    <div key={ls.id} className="card-elevated p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: colors.bg, color: colors.color }}>
                          {ls.kategori}
                        </span>
                        <div className="text-2xl" style={{ 
                          color: ls.nilai >= 4 ? 'var(--success)' : ls.nilai >= 3 ? 'var(--warning)' : 'var(--danger)' 
                        }}>
                          {getStarRating(ls.nilai)}
                        </div>
                      </div>
                      <h4 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>{ls.skill}</h4>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{ls.keterangan}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Kehadiran Hari Ini */}
            <div className="card-elevated p-5">
              <h3 className="font-bold mb-3" style={{ color: 'var(--foreground)' }}>Kehadiran</h3>
              {(() => {
                const kh = kehadiranList.find(k => k.tanggal === tanggalTerpilih);
                if (!kh) {
                  return <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Belum ada data kehadiran</p>;
                }
                const badgeColors = {
                  'Hadir': { bg: 'var(--success-bg)', color: 'var(--success)' },
                  'Sakit': { bg: 'var(--warning-bg)', color: 'var(--warning)' },
                  'Izin': { bg: 'var(--info-bg)', color: 'var(--info)' },
                  'Alpha': { bg: 'var(--danger-bg)', color: 'var(--danger)' },
                };
                const colors = badgeColors[kh.status];
                return (
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: colors.bg, color: colors.color }}>
                      {kh.status}
                    </span>
                    {kh.keterangan && (
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{kh.keterangan}</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
