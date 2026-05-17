'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { User, Calendar, TrendingUp, Star, BookOpen, Clock, AlertCircle, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import { getStudentsList } from '@/utils/students';
import { Student } from '@/app/student-management/components/StudentManagementClient';
import { useAuth } from '@/app/AuthContext';
import {
  getKehadiranBySiswa,
  getPoinBySiswa,
  getAktivitasByKelas,
  getTotalPoinBySiswa,
  getPresentaseKehadiran,
  Kehadiran,
  PoinPerilaku,
  AktivitasKelas
} from '@/utils/muridProfile';

export default function ProfilMuridPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const siswaIdParam = searchParams.get('id');
  
  const [siswa, setSiswa] = useState<Student | null>(null);
  const [kehadiran, setKehadiran] = useState<Kehadiran[]>([]);
  const [poinList, setPoinList] = useState<PoinPerilaku[]>([]);
  const [aktivitas, setAktivitas] = useState<AktivitasKelas[]>([]);
  const [totalPoin, setTotalPoin] = useState(0);
  const [presentaseKehadiran, setPresentaseKehadiran] = useState(100);

  useEffect(() => {
    const students = getStudentsList();
    let targetId = siswaIdParam;
    
    // Jika tidak ada id param dan role adalah murid, cari berdasarkan nama
    if (!targetId && user?.role === 'murid') {
      const found = students.find(s => 
        s.nama.toLowerCase().includes(user.username.toLowerCase()) || 
        s.nis === user.username);
      targetId = found?.id;
    }

    if (targetId) {
      const found = students.find(s => s.id === targetId);
      setSiswa(found || null);
      
      if (found) {
        setKehadiran(getKehadiranBySiswa(found.id));
        setPoinList(getPoinBySiswa(found.id));
        setAktivitas(getAktivitasByKelas(found.kelas));
        setTotalPoin(getTotalPoinBySiswa(found.id));
        setPresentaseKehadiran(getPresentaseKehadiran(found.id));
      }
    }
  }, [siswaIdParam, user]);

  if (!siswa) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle size={40} className="mb-4" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Siswa tidak ditemukan</p>
          <button onClick={() => router.push('/student-management')} className="btn-secondary mt-4">
            <ChevronLeft size={14} /> Kembali ke Daftar Siswa
          </button>
        </div>
      </AppLayout>
    );
  }

  const getPoinStatus = (poin: number) => {
    if (poin >= 80) return { label: 'Baik', color: 'var(--success)', bg: 'var(--success-bg)' };
    if (poin >= 60) return { label: 'Cukup', color: 'var(--warning)', bg: 'var(--warning-bg)' };
    return { label: 'Perlu Perhatian', color: 'var(--danger)', bg: 'var(--danger-bg)' };
  };

  const poinStatus = getPoinStatus(totalPoin);

  const getKehadiranIcon = (status: Kehadiran['status']) => {
    switch (status) {
      case 'Hadir': return <CheckCircle size={14} style={{ color: 'var(--success)' }} />;
      case 'Sakit': return <AlertCircle size={14} style={{ color: 'var(--warning)' }} />;
      case 'Izin': return <Clock size={14} style={{ color: 'var(--info)' }} />;
      case 'Alpha': return <XCircle size={14} style={{ color: 'var(--danger)' }} />;
    }
  };

  const trenPoinMingguan = poinList.slice(0, 7);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/student-management')} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Profil Siswa</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Profil dan perkembangan {siswa.nama}
            </p>
          </div>
        </div>

        {/* Profil Siswa */}
        <div className="card-elevated p-5">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
              <User size={32} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{siswa.nama}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <Calendar size={14} className="inline mr-1" /> {siswa.tanggalLahir}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>NIS</p>
                  <p className="font-mono text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{siswa.nis}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Kelas</p>
                  <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{siswa.kelas}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Wali Kelas</p>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>{siswa.waliKelas}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Alamat</p>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>{siswa.alamat}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Orang Tua</p>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>{siswa.namaOrangTua}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{siswa.noTelp}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Perkembangan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-elevated p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} style={{ color: 'var(--info)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Kehadiran</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--info)' }}>{presentaseKehadiran}%</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {kehadiran.filter(k => k.status === 'Hadir').length} hari hadir
            </p>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} style={{ color: poinStatus.color }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Poin Perilaku</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: poinStatus.color }}>{totalPoin}</p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: poinStatus.bg, color: poinStatus.color }}>
              {poinStatus.label}
            </span>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Status</span>
            </div>
            <p className="text-lg font-bold" style={{ color: siswa.status === 'Aktif' ? 'var(--success)' : 'var(--danger)' }}>
              {siswa.status}
            </p>
          </div>
        </div>

        {/* Tren Poin Perilaku & Kehadiran */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tren Poin Perilaku */}
          <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
              <h3 className="font-bold">Tren Poin Perilaku</h3>
            </div>
            {trenPoinMingguan.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                Belum ada data poin perilaku
              </p>
            ) : (
              <div className="space-y-3">
                {trenPoinMingguan.map((poin, index) => (
                  <div key={poin.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{poin.tanggal}</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{poin.keterangan}</p>
                    </div>
                    <span className={`text-sm font-bold ${poin.jenis === 'Tambah' ? 'text-green-600' : 'text-red-600'}`}>
                      {poin.jenis === 'Tambah' ? '+' : '-'}{poin.poin}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aktivitas Kelas */}
          <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} style={{ color: 'var(--success)' }} />
              <h3 className="font-bold">Aktivitas Kelas {siswa.kelas}</h3>
            </div>
            {aktivitas.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                Belum ada aktivitas kelas
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {aktivitas.slice(0, 5).map(akt => (
                  <div key={akt.id} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>{akt.jenis}</span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{akt.tanggal}</span>
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{akt.judul}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{akt.keterangan}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Riwayat Kehadiran */}
        <div className="card-elevated overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
            <div className="flex items-center gap-2">
              <Calendar size={16} style={{ color: 'var(--info)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Riwayat Kehadiran</span>
            </div>
          </div>
          {kehadiran.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar size={36} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Belum ada riwayat kehadiran</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {kehadiran.slice(0, 10).map(k => (
                <div key={k.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getKehadiranIcon(k.status)}
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{k.tanggal}</p>
                      {k.keterangan && (
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{k.keterangan}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    k.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                    k.status === 'Sakit' ? 'bg-yellow-100 text-yellow-700' :
                    k.status === 'Izin' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {k.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
