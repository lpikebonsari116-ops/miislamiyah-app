'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/app/AuthContext';
import {
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Users,
  Star,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getStudentsList } from '@/utils/students';
import { getKelasList } from '@/utils/kelas';
import { getGuruList } from '@/utils/guru';
import {
  getKehadiranList,
  getKehadiranBySiswa,
  Kehadiran
} from '@/utils/muridProfile';
import {
  getLifeSkillList,
  getLifeSkillBySiswa,
  LifeSkillHarian
} from '@/utils/lifeSkill';
import {
  exportToCSV,
  exportToPDF,
  getWeekDates,
  getMonthDates,
  formatDateRange
} from '@/utils/export';

interface FilterState {
  periode: 'mingguan' | 'bulanan';
  tanggalMulai: string;
  tanggalSelesai: string;
  kelas: string;
  guru: string;
}

export default function LaporanGuruPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    periode: 'bulanan',
    tanggalMulai: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    tanggalSelesai: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    kelas: '',
    guru: ''
  });
  const [students, setStudents] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [guruList, setGuruList] = useState<any[]>([]);
  const [kehadiranList, setKehadiranList] = useState<Kehadiran[]>([]);
  const [lifeSkillList, setLifeSkillList] = useState<LifeSkillHarian[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStudents(getStudentsList());
    setKelasList(getKelasList());
    setGuruList(getGuruList());
    setKehadiranList(getKehadiranList());
    setLifeSkillList(getLifeSkillList());
  }, []);

  const setPeriode = (type: 'mingguan' | 'bulanan') => {
    const today = new Date();
    let start, end;
    if (type === 'mingguan') {
      const week = getWeekDates(new Date());
      start = week.start.toISOString().split('T')[0];
      end = week.end.toISOString().split('T')[0];
    } else {
      const month = getMonthDates(new Date());
      start = month.start.toISOString().split('T')[0];
      end = month.end.toISOString().split('T')[0];
    }
    setFilters(f => ({ ...f, periode: type, tanggalMulai: start, tanggalSelesai: end }));
  };

  const gantiPeriode = (arah: 'sebelum' | 'sesudah') => {
    const mulai = new Date(filters.tanggalMulai);
    const selesai = new Date(filters.tanggalSelesai);
    
    if (filters.periode === 'mingguan') {
      const days = arah === 'sebelum' ? -7 : 7;
      mulai.setDate(mulai.getDate() + days);
      selesai.setDate(selesai.getDate() + days);
    } else {
      const months = arah === 'sebelum' ? -1 : 1;
      mulai.setMonth(mulai.getMonth() + months);
      selesai.setMonth(selesai.getMonth() + months);
      selesai.setDate(new Date(selesai.getFullYear(), selesai.getMonth() + 1, 0).getDate());
    }
    
    setFilters(f => ({
      ...f,
      tanggalMulai: mulai.toISOString().split('T')[0],
      tanggalSelesai: selesai.toISOString().split('T')[0]
    }));
  };

  const filteredStudents = students.filter(s => {
    if (filters.kelas && s.kelas !== filters.kelas) return false;
    return true;
  });

  const getRekapSiswa = (siswa: any) => {
    const kh = getKehadiranBySiswa(siswa.id).filter(k => 
      k.tanggal >= filters.tanggalMulai && k.tanggal <= filters.tanggalSelesai
    );
    const ls = getLifeSkillBySiswa(siswa.id).filter(l => 
      l.tanggal >= filters.tanggalMulai && l.tanggal <= filters.tanggalSelesai
    );

    const hadir = kh.filter(k => k.status === 'Hadir').length;
    const sakit = kh.filter(k => k.status === 'Sakit').length;
    const izin = kh.filter(k => k.status === 'Izin').length;
    const alpha = kh.filter(k => k.status === 'Alpha').length;
    const totalKehadiran = kh.length;
    const presentase = totalKehadiran > 0 ? Math.round((hadir / totalKehadiran) * 100) : 100;

    const totalNilai = ls.reduce((sum, l) => sum + l.nilai, 0);
    const rataLifeSkill = ls.length > 0 ? Math.round((totalNilai / ls.length) * 10) / 10 : 0;

    return {
      kehadiran: { hadir, sakit, izin, alpha, total: totalKehadiran, presentase },
      lifeSkill: { total: ls.length, rataRata: rataLifeSkill }
    };
  };

  const dataExport = () => {
    return filteredStudents.map(siswa => {
      const rekap = getRekapSiswa(siswa);
      return {
        'NIS': siswa.nis,
        'Nama Siswa': siswa.nama,
        'Kelas': siswa.kelas,
        'Hadir': rekap.kehadiran.hadir,
        'Sakit': rekap.kehadiran.sakit,
        'Izin': rekap.kehadiran.izin,
        'Alpha': rekap.kehadiran.alpha,
        'Persentase Kehadiran': `${rekap.kehadiran.presentase}%`,
        'Rata-rata Life Skill': rekap.lifeSkill.rataRata
      };
    });
  };

  const handleExportExcel = () => {
    const filename = `Laporan_${filters.periode}_${filters.tanggalMulai}_sd_${filters.tanggalSelesai}`;
    exportToCSV(dataExport(), filename);
  };

  const handleExportPDF = () => {
    const rekapData = filteredStudents.map(siswa => {
      const rekap = getRekapSiswa(siswa);
      return { siswa, rekap };
    });

    const content = `
      <div class="header">
        <h1>LAPORAN REKAPITULASI</h1>
        <p class="info"><strong>Periode:</strong> ${formatDateRange(new Date(filters.tanggalMulai), new Date(filters.tanggalSelesai))}</p>
        ${filters.kelas ? `<p class="info"><strong>Kelas:</strong> ${filters.kelas}</p>` : ''}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>NIS</th>
            <th>Nama Siswa</th>
            <th>Kelas</th>
            <th>Hadir</th>
            <th>Sakit</th>
            <th>Izin</th>
            <th>Alpha</th>
            <th>Persentase</th>
            <th>Rata-rata LS</th>
          </tr>
        </thead>
        <tbody>
          ${rekapData.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.siswa.nis}</td>
              <td>${item.siswa.nama}</td>
              <td>${item.siswa.kelas}</td>
              <td>${item.rekap.kehadiran.hadir}</td>
              <td>${item.rekap.kehadiran.sakit}</td>
              <td>${item.rekap.kehadiran.izin}</td>
              <td>${item.rekap.kehadiran.alpha}</td>
              <td>${item.rekap.kehadiran.presentase}%</td>
              <td>${item.rekap.lifeSkill.rataRata}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const filename = `Laporan_${filters.periode}_${filters.tanggalMulai}`;
    exportToPDF(content, filename);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Laporan & Rekapitulasi</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Rekap absensi, poin perilaku, dan life skill murid
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
              <FileSpreadsheet size={16} /> Excel
            </button>
            <button onClick={handleExportPDF} className="btn-primary flex items-center gap-2">
              <FileText size={16} /> PDF
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} style={{ color: 'var(--primary)' }} />
            <h3 className="font-bold">Filter Laporan</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Periode */}
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Periode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriode('mingguan')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.periode === 'mingguan' 
                      ? 'btn-primary' 
                      : 'btn-secondary'
                  }`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => setPeriode('bulanan')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.periode === 'bulanan' 
                      ? 'btn-primary' 
                      : 'btn-secondary'
                  }`}
                >
                  Bulanan
                </button>
              </div>
            </div>

            {/* Tanggal */}
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Tanggal</label>
              <div className="flex items-center gap-2">
                <button onClick={() => gantiPeriode('sebelum')} className="p-2 rounded-lg hover:bg-gray-100">
                  <ChevronLeft size={16} />
                </button>
                <div className="flex-1 text-center">
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{filters.tanggalMulai}</p>
                  <p className="text-xs">s/d</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{filters.tanggalSelesai}</p>
                </div>
                <button onClick={() => gantiPeriode('sesudah')} className="p-2 rounded-lg hover:bg-gray-100">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Kelas */}
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Kelas</label>
              <select
                value={filters.kelas}
                onChange={e => setFilters(f => ({ ...f, kelas: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border)' }}
              >
                <option value="">Semua Kelas</option>
                {kelasList.map(k => (
                  <option key={k.id} value={k.namaKelas}>{k.namaKelas}</option>
                ))}
              </select>
            </div>

            {/* Guru */}
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Guru</label>
              <select
                value={filters.guru}
                onChange={e => setFilters(f => ({ ...f, guru: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border)' }}
              >
                <option value="">Semua Guru</option>
                {guruList.map(g => (
                  <option key={g.id} value={g.nama}>{g.nama}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistik Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Total Siswa</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{filteredStudents.length}</p>
          </div>

          <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} style={{ color: 'var(--success)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Rata-rata Kehadiran</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--success)' }}>
              {filteredStudents.length > 0
                ? Math.round(filteredStudents.reduce((sum, s) => sum + getRekapSiswa(s).kehadiran.presentase, 0) / filteredStudents.length)
                : 0}%
            </p>
          </div>

          <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-2">
              <Star size={18} style={{ color: 'var(--warning)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Rata-rata Life Skill</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--warning)' }}>
              {filteredStudents.length > 0
                ? (filteredStudents.reduce((sum, s) => sum + getRekapSiswa(s).lifeSkill.rataRata, 0) / filteredStudents.length).toFixed(1)
                : 0}
            </p>
          </div>

          <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-2">
              <Award size={18} style={{ color: 'var(--info)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Total Catatan</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--info)' }}>
              {lifeSkillList.filter(l => 
                l.tanggal >= filters.tanggalMulai && l.tanggal <= filters.tanggalSelesai
              ).length}
            </p>
          </div>
        </div>

        {/* Tabel Rekap */}
        <div className="card-elevated overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
            <div className="flex items-center gap-2">
              <Users size={16} style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Rekapitulasi Siswa</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              {filteredStudents.length} siswa
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>NIS</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Nama Siswa</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Kelas</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }} colSpan={4}>Kehadiran</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>%</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Life Skill</th>
                </tr>
                <tr style={{ backgroundColor: 'var(--muted)' }}>
                  <th className="px-4 py-1"></th>
                  <th className="px-4 py-1"></th>
                  <th className="px-4 py-1"></th>
                  <th className="px-2 py-1 text-center text-xs" style={{ color: 'var(--success)' }}><CheckCircle size={12} className="inline" /> H</th>
                  <th className="px-2 py-1 text-center text-xs" style={{ color: 'var(--warning)' }}><Clock size={12} className="inline" /> S</th>
                  <th className="px-2 py-1 text-center text-xs" style={{ color: 'var(--info)' }}><AlertCircle size={12} className="inline" /> I</th>
                  <th className="px-2 py-1 text-center text-xs" style={{ color: 'var(--danger)' }}><XCircle size={12} className="inline" /> A</th>
                  <th className="px-4 py-1"></th>
                  <th className="px-4 py-1"></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filteredStudents.slice(0, 20).map(siswa => {
                  const rekap = getRekapSiswa(siswa);
                  return (
                    <tr key={siswa.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm" style={{ color: 'var(--muted-foreground)' }}>{siswa.nis}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{siswa.nama}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                          {siswa.kelas}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center font-semibold text-sm" style={{ color: 'var(--success)' }}>{rekap.kehadiran.hadir}</td>
                      <td className="px-2 py-3 text-center font-semibold text-sm" style={{ color: 'var(--warning)' }}>{rekap.kehadiran.sakit}</td>
                      <td className="px-2 py-3 text-center font-semibold text-sm" style={{ color: 'var(--info)' }}>{rekap.kehadiran.izin}</td>
                      <td className="px-2 py-3 text-center font-semibold text-sm" style={{ color: 'var(--danger)' }}>{rekap.kehadiran.alpha}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${
                          rekap.kehadiran.presentase >= 90 ? 'text-green-600' :
                          rekap.kehadiran.presentase >= 80 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {rekap.kehadiran.presentase}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${
                          rekap.lifeSkill.rataRata >= 4 ? 'text-green-600' :
                          rekap.lifeSkill.rataRata >= 3 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {rekap.lifeSkill.rataRata}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <Users size={36} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Tidak ada data siswa</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredStudents.length > 20 && (
            <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
              <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                Menampilkan 20 dari {filteredStudents.length} siswa. Export untuk melihat semua data.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
