'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { ClipboardList, Plus, Search, CheckCircle, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { toast } from 'sonner';

type StatusAbsensi = 'Hadir' | 'Sakit' | 'Izin' | 'Alpha' | '';

interface AbsensiRecord {
  siswaId: string;
  nama: string;
  status: StatusAbsensi;
  keterangan: string;
}

interface AbsensiSession {
  id: string;
  kelas: string;
  tanggal: string;
  mataPelajaran: string;
  guru: string;
  records: AbsensiRecord[];
}

interface SupabaseAttendanceRecord {
  status: StatusAbsensi;
  keterangan: string | null;
  student_id: string;
  students: { nama: string } | null;
}

interface SupabaseAttendanceSession {
  id: string;
  kelas: string;
  tanggal: string;
  mata_pelajaran: string;
  guru: string;
  attendance_records: SupabaseAttendanceRecord[];
}

const KELAS_OPTIONS = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
const MAPEL_OPTIONS = [
  'Al-Quran Hadits',
  'Matematika',
  'Bahasa Indonesia',
  'IPA',
  'IPS',
  'Bahasa Inggris',
  'Penjaskes',
  'Tahfidz',
  'Fiqih',
  'Aqidah Akhlak',
];

const STATUS_CONFIG: Record<
  StatusAbsensi,
  { label: string; bg: string; color: string; short: string }
> = {
  Hadir: { label: 'Hadir', bg: '#dcfce7', color: '#166534', short: 'H' },
  Sakit: { label: 'Sakit', bg: '#dbeafe', color: '#1e40af', short: 'S' },
  Izin: { label: 'Izin', bg: '#fef3c7', color: '#92400e', short: 'I' },
  Alpha: { label: 'Alpha', bg: '#fee2e2', color: '#991b1b', short: 'A' },
  '': { label: 'Belum', bg: '#f1f5f9', color: '#64748b', short: '-' },
};

export default function AbsensiPage() {
  const [sessions, setSessions] = useState<AbsensiSession[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'riwayat'>('input');
  const [selectedKelas, setSelectedKelas] = useState('4A');
  const [selectedTanggal, setSelectedTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMapel, setSelectedMapel] = useState('Matematika');
  const [records, setRecords] = useState<AbsensiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchRiwayat, setSearchRiwayat] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select(
          `
          *,
          attendance_records (
            status,
            keterangan,
            student_id,
            students (nama)
          )
        `
        )
        .order('tanggal', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedSessions: AbsensiSession[] = (data as unknown as SupabaseAttendanceSession[]).map(
          (s) => ({
            id: s.id,
            kelas: s.kelas,
            tanggal: s.tanggal,
            mataPelajaran: s.mata_pelajaran,
            guru: s.guru,
            records: s.attendance_records.map((r) => ({
              siswaId: r.student_id,
              nama: r.students?.nama || 'N/A',
              status: r.status,
              keterangan: r.keterangan || '',
            })),
          })
        );
        setSessions(mappedSessions);
      }
    } catch (_error: unknown) {
      console.error('Error fetching history');
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const fetchStudentsByClass = useCallback(async (kelas: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('id, nama')
        .eq('kelas', kelas)
        .eq('status', 'Aktif')
        .order('nama', { ascending: true });

      if (error) throw error;

      if (data) {
        setRecords(
          data.map((s) => ({
            siswaId: s.id,
            nama: s.nama,
            status: 'Hadir' as StatusAbsensi,
            keterangan: '',
          }))
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching students:', message);
      toast.error('Gagal mengambil data siswa');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'input') {
      fetchStudentsByClass(selectedKelas);
    }
  }, [selectedKelas, activeTab, fetchStudentsByClass]);

  function setStatus(siswaId: string, status: StatusAbsensi) {
    setRecords((prev) => prev.map((r) => (r.siswaId === siswaId ? { ...r, status } : r)));
    setSaved(false);
  }

  function setKeterangan(siswaId: string, keterangan: string) {
    setRecords((prev) => prev.map((r) => (r.siswaId === siswaId ? { ...r, keterangan } : r)));
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // 1. Create Session
      const { data: sessionData, error: sessionError } = await supabase
        .from('attendance_sessions')
        .insert([
          {
            kelas: selectedKelas,
            tanggal: selectedTanggal,
            mata_pelajaran: selectedMapel,
            guru: 'Ahmad Fauzi, S.Pd', // In production, get from auth context
          },
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Create Records
      const recordPayload = records.map((r) => ({
        session_id: sessionData.id,
        student_id: r.siswaId,
        status: r.status,
        keterangan: r.keterangan,
      }));

      const { error: recordsError } = await supabase
        .from('attendance_records')
        .insert(recordPayload);

      if (recordsError) throw recordsError;

      setSaved(true);
      toast.success('Absensi berhasil disimpan');
      fetchHistory();
      setTimeout(() => setSaved(false), 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving attendance:', message);
      toast.error('Gagal menyimpan absensi');
    } finally {
      setIsSaving(false);
    }
  };

  function markAll(status: StatusAbsensi) {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  }

  const hadir = records.filter((r) => r.status === 'Hadir').length;
  const sakit = records.filter((r) => r.status === 'Sakit').length;
  const izin = records.filter((r) => r.status === 'Izin').length;
  const alpha = records.filter((r) => r.status === 'Alpha').length;

  const filteredSessions = sessions.filter(
    (s) =>
      s.kelas.toLowerCase().includes(searchRiwayat.toLowerCase()) ||
      s.mataPelajaran.toLowerCase().includes(searchRiwayat.toLowerCase()) ||
      s.tanggal.includes(searchRiwayat)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Absensi Siswa
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Catat kehadiran siswa per kelas dan mata pelajaran
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('input')}
              className={activeTab === 'input' ? 'btn-primary' : 'btn-secondary'}
            >
              <Plus size={16} /> Input Absensi
            </button>
            <button
              onClick={() => setActiveTab('riwayat')}
              className={activeTab === 'riwayat' ? 'btn-primary' : 'btn-secondary'}
            >
              <ClipboardList size={16} /> Riwayat
            </button>
          </div>
        </div>

        {activeTab === 'input' && (
          <>
            {/* Controls */}
            <div className="card-elevated p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Kelas
                </label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }}
                >
                  {KELAS_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Tanggal
                </label>
                <input
                  type="date"
                  value={selectedTanggal}
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Mata Pelajaran
                </label>
                <select
                  value={selectedMapel}
                  onChange={(e) => setSelectedMapel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }}
                >
                  {MAPEL_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Hadir', count: hadir, ...STATUS_CONFIG['Hadir'] },
                { label: 'Sakit', count: sakit, ...STATUS_CONFIG['Sakit'] },
                { label: 'Izin', count: izin, ...STATUS_CONFIG['Izin'] },
                { label: 'Alpha', count: alpha, ...STATUS_CONFIG['Alpha'] },
              ].map((s) => (
                <div key={s.label} className="card-elevated p-3 text-center">
                  <p className="text-2xl font-bold" style={{ color: s.color }}>
                    {s.count}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Absensi Table */}
            <div className="card-elevated overflow-hidden">
              <div
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  Kelas {selectedKelas} — {records.length} siswa
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => markAll('Hadir')}
                    className="text-xs px-2 py-1 rounded font-medium"
                    style={{ backgroundColor: '#dcfce7', color: '#166534' }}
                  >
                    Semua Hadir
                  </button>
                </div>
              </div>
              {isLoading ? (
                <div
                  className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3"
                >
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="font-medium">Memuat data siswa...</p>
                </div>
              ) : records.length === 0 ? (
                <div
                  className="p-8 text-center text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Data siswa untuk kelas {selectedKelas} belum tersedia
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        style={{
                          backgroundColor: 'var(--muted)',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <th
                          className="px-4 py-3 text-left text-xs font-semibold"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          No
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-semibold"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          Nama Siswa
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-semibold"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          Status Kehadiran
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-semibold"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          Keterangan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((rec, i) => {
                        return (
                          <tr
                            key={rec.siswaId}
                            style={{
                              borderBottom: '1px solid var(--border)',
                              backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                            }}
                          >
                            <td
                              className="px-4 py-3 text-xs"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              {i + 1}
                            </td>
                            <td
                              className="px-4 py-3 font-medium"
                              style={{ color: 'var(--foreground)' }}
                            >
                              {rec.nama}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1.5">
                                {(['Hadir', 'Sakit', 'Izin', 'Alpha'] as StatusAbsensi[]).map(
                                  (s) => {
                                    const cfg = STATUS_CONFIG[s];
                                    return (
                                      <button
                                        key={s}
                                        onClick={() => setStatus(rec.siswaId, s)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                          rec.status === s
                                            ? 'ring-2 ring-offset-1 shadow-sm'
                                            : 'opacity-50 hover:opacity-80'
                                        }`}
                                        style={{
                                          backgroundColor: cfg.bg,
                                          color: cfg.color,
                                          boxShadow:
                                            rec.status === s ? `0 0 0 2px ${cfg.color}` : 'none',
                                        }}
                                      >
                                        {cfg.label}
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                value={rec.keterangan}
                                onChange={(e) => setKeterangan(rec.siswaId, e.target.value)}
                                placeholder="Keterangan (opsional)"
                                className="w-full px-2 py-1 rounded border text-xs"
                                style={{
                                  borderColor: 'var(--border)',
                                  backgroundColor: 'var(--input)',
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div
                className="px-4 py-3 border-t flex justify-end"
                style={{ borderColor: 'var(--border)' }}
              >
                <button className="btn-primary" onClick={handleSave} disabled={isSaving || isLoading}>
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Menyimpan...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle size={16} /> Tersimpan!
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Simpan Absensi
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'riwayat' && (
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted-foreground)' }}
                />
                <input
                  value={searchRiwayat}
                  onChange={(e) => setSearchRiwayat(e.target.value)}
                  placeholder="Cari kelas, mata pelajaran, atau tanggal..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'var(--muted)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {[
                      'Tanggal',
                      'Kelas',
                      'Mata Pelajaran',
                      'Guru',
                      'Hadir',
                      'Sakit',
                      'Izin',
                      'Alpha',
                      'Total',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-sm"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        Belum ada riwayat absensi
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session, i) => {
                      const h = session.records.filter((r) => r.status === 'Hadir').length;
                      const s = session.records.filter((r) => r.status === 'Sakit').length;
                      const iz = session.records.filter((r) => r.status === 'Izin').length;
                      const al = session.records.filter((r) => r.status === 'Alpha').length;
                      return (
                        <tr
                          key={session.id}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                          }}
                        >
                          <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>
                            {session.tanggal}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-semibold"
                              style={{
                                backgroundColor: 'var(--primary-light)',
                                color: 'var(--primary)',
                              }}
                            >
                              {session.kelas}
                            </span>
                          </td>
                          <td
                            className="px-4 py-3 font-medium"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {session.mataPelajaran}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {session.guru}
                          </td>
                          <td className="px-4 py-3 font-bold text-green-600">{h}</td>
                          <td className="px-4 py-3 font-bold text-blue-600">{s}</td>
                          <td className="px-4 py-3 font-bold text-yellow-600">{iz}</td>
                          <td className="px-4 py-3 font-bold text-red-600">{al}</td>
                          <td
                            className="px-4 py-3 font-bold"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {session.records.length}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
