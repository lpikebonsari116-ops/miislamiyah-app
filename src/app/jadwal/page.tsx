'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { CalendarDays, Plus, Edit2, Trash2, X, Save, Clock } from 'lucide-react';
import { getMapelList } from '@/utils/mapel';

interface JadwalItem {
  id: string;
  kelas: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  mataPelajaran: string;
  guru: string;
  ruangan: string;
}

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const KELAS_OPTIONS = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
const GURU_OPTIONS = [
  'Ibu Sari Dewi, S.Pd', 'Ibu Nurul Hidayah, S.Pd', 'Pak Agus Wahyudi, S.Pd',
  'Ibu Fatimah Zahra, S.Pd', 'Pak Rudi Hartono, S.Pd', 'Pak Yusuf Effendi, S.Pd',
  'Ibu Rina Kusuma, S.Pd', 'Pak Denny Firmansyah, S.Pd', 'Ibu Laila Mufidah, S.Pd',
  'Pak Ahmad Fauzi, S.Pd', 'Ibu Khadijah Nur, S.Pd',
];

const MAPEL_COLORS: Record<string, { bg: string; color: string }> = {
  'Al-Quran Hadits': { bg: '#dcfce7', color: '#166534' },
  'Aqidah Akhlak': { bg: '#d1fae5', color: '#065f46' },
  'Fiqih': { bg: '#a7f3d0', color: '#064e3b' },
  'SKI': { bg: '#6ee7b7', color: '#064e3b' },
  'Bahasa Arab': { bg: '#dbeafe', color: '#1e40af' },
  'Matematika': { bg: '#fee2e2', color: '#991b1b' },
  'Bahasa Indonesia': { bg: '#fef3c7', color: '#92400e' },
  'IPA': { bg: '#e0e7ff', color: '#3730a3' },
  'IPS': { bg: '#fce7f3', color: '#9d174d' },
  'Bahasa Inggris': { bg: '#f3e8ff', color: '#6b21a8' },
  'Penjaskes': { bg: '#ffedd5', color: '#9a3412' },
  'Tahfidz': { bg: '#ecfdf5', color: '#065f46' },
};

function getMapelColor(mapel: string) {
  return MAPEL_COLORS[mapel] || { bg: '#f1f5f9', color: '#475569' };
}

const mockJadwal: JadwalItem[] = [
  { id: 'j001', kelas: '4A', hari: 'Senin', jamMulai: '07:00', jamSelesai: '07:30', mataPelajaran: 'Tahfidz', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j002', kelas: '4A', hari: 'Senin', jamMulai: '07:30', jamSelesai: '08:40', mataPelajaran: 'Matematika', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j003', kelas: '4A', hari: 'Senin', jamMulai: '08:40', jamSelesai: '09:50', mataPelajaran: 'Bahasa Indonesia', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j004', kelas: '4A', hari: 'Senin', jamMulai: '10:10', jamSelesai: '11:20', mataPelajaran: 'IPA', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j005', kelas: '4A', hari: 'Selasa', jamMulai: '07:00', jamSelesai: '07:30', mataPelajaran: 'Tahfidz', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j006', kelas: '4A', hari: 'Selasa', jamMulai: '07:30', jamSelesai: '08:40', mataPelajaran: 'Al-Quran Hadits', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j007', kelas: '4A', hari: 'Selasa', jamMulai: '08:40', jamSelesai: '09:50', mataPelajaran: 'IPS', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j008', kelas: '4A', hari: 'Rabu', jamMulai: '07:00', jamSelesai: '07:30', mataPelajaran: 'Tahfidz', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j009', kelas: '4A', hari: 'Rabu', jamMulai: '07:30', jamSelesai: '08:40', mataPelajaran: 'Bahasa Inggris', guru: 'Pak Ahmad Fauzi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j010', kelas: '4A', hari: 'Rabu', jamMulai: '08:40', jamSelesai: '09:50', mataPelajaran: 'Fiqih', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j011', kelas: '4A', hari: 'Kamis', jamMulai: '07:00', jamSelesai: '07:30', mataPelajaran: 'Tahfidz', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j012', kelas: '4A', hari: 'Kamis', jamMulai: '07:30', jamSelesai: '08:40', mataPelajaran: 'Aqidah Akhlak', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j013', kelas: '4A', hari: 'Kamis', jamMulai: '08:40', jamSelesai: '09:50', mataPelajaran: 'PPKN', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j014', kelas: '4A', hari: 'Jumat', jamMulai: '07:00', jamSelesai: '07:30', mataPelajaran: 'Tahfidz', guru: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401' },
  { id: 'j015', kelas: '4A', hari: 'Jumat', jamMulai: '07:30', jamSelesai: '08:40', mataPelajaran: 'Penjaskes', guru: 'Pak Rudi Hartono, S.Pd', ruangan: 'Lapangan' },
  { id: 'j016', kelas: '5A', hari: 'Senin', jamMulai: '07:00', jamSelesai: '07:30', mataPelajaran: 'Tahfidz', guru: 'Ibu Rina Kusuma, S.Pd', ruangan: 'Ruang 501' },
  { id: 'j017', kelas: '5A', hari: 'Senin', jamMulai: '07:30', jamSelesai: '08:40', mataPelajaran: 'Matematika', guru: 'Ibu Rina Kusuma, S.Pd', ruangan: 'Ruang 501' },
  { id: 'j018', kelas: '5A', hari: 'Selasa', jamMulai: '07:30', jamSelesai: '08:40', mataPelajaran: 'IPA', guru: 'Ibu Rina Kusuma, S.Pd', ruangan: 'Ruang 501' },
];

interface FormState {
  kelas: string; hari: string; jamMulai: string; jamSelesai: string;
  mataPelajaran: string; guru: string; ruangan: string;
}
const emptyForm: FormState = { kelas: '4A', hari: 'Senin', jamMulai: '07:00', jamSelesai: '08:00', mataPelajaran: '', guru: '', ruangan: '' };

export default function JadwalPelajaranPage() {
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>(mockJadwal);
  const [selectedKelas, setSelectedKelas] = useState('4A');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<JadwalItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<JadwalItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [mapelOptions, setMapelOptions] = useState<string[]>([]);

  useEffect(() => {
    setMapelOptions(getMapelList());
  }, []);

  const jadwalKelas = jadwalList.filter(j => j.kelas === selectedKelas);

  function openAdd() {
    setEditItem(null);
    setForm({ ...emptyForm, kelas: selectedKelas });
    setShowModal(true);
  }

  function openEdit(item: JadwalItem) {
    setEditItem(item);
    setForm({ kelas: item.kelas, hari: item.hari, jamMulai: item.jamMulai, jamSelesai: item.jamSelesai, mataPelajaran: item.mataPelajaran, guru: item.guru, ruangan: item.ruangan });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.mataPelajaran || !form.guru || !form.ruangan) return;
    if (editItem) {
      setJadwalList(prev => prev.map(j => j.id === editItem.id ? { ...j, ...form } : j));
    } else {
      setJadwalList(prev => [...prev, { id: `j${Date.now()}`, ...form }]);
    }
    setShowModal(false);
  }

  function handleDelete() {
    if (!deleteItem) return;
    setJadwalList(prev => prev.filter(j => j.id !== deleteItem.id));
    setDeleteItem(null);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Jadwal Pelajaran</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Kelola jadwal pelajaran per kelas MI Islamiyah</p>
          </div>
          <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Tambah Jadwal</button>
        </div>

        {/* Kelas Selector */}
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Pilih Kelas:</span>
            {KELAS_OPTIONS.map(k => (
              <button key={k} onClick={() => setSelectedKelas(k)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${selectedKelas === k ? 'text-white shadow-md' : 'hover:bg-gray-100'}`}
                style={selectedKelas === k ? { backgroundColor: 'var(--primary)' } : { color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="card-elevated overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
            <CalendarDays size={16} style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Jadwal Kelas {selectedKelas}</span>
            <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)' }}>{jadwalKelas.length} sesi</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'var(--border)' }}>
            {HARI.map(hari => {
              const jadwalHari = jadwalKelas.filter(j => j.hari === hari).sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
              return (
                <div key={hari} className="p-3">
                  <div className="text-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{hari}</span>
                  </div>
                  <div className="space-y-2">
                    {jadwalHari.length === 0 ? (
                      <p className="text-xs text-center py-4" style={{ color: 'var(--muted-foreground)' }}>Tidak ada jadwal</p>
                    ) : jadwalHari.map(item => {
                      const mc = getMapelColor(item.mataPelajaran);
                      return (
                        <div key={item.id} className="rounded-lg p-2.5 border group relative" style={{ backgroundColor: mc.bg, borderColor: mc.color + '40' }}>
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate" style={{ color: mc.color }}>{item.mataPelajaran}</p>
                              <p className="text-xs truncate mt-0.5" style={{ color: mc.color + 'cc' }}>{item.guru.split(',')[0]}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock size={10} style={{ color: mc.color + '99' }} />
                                <span className="text-xs" style={{ color: mc.color + '99' }}>{item.jamMulai}–{item.jamSelesai}</span>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button onClick={() => openEdit(item)} className="p-1 rounded hover:bg-white/50 transition-colors" style={{ color: mc.color }}>
                                <Edit2 size={11} />
                              </button>
                              <button onClick={() => setDeleteItem(item)} className="p-1 rounded hover:bg-white/50 transition-colors text-red-500">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{editItem ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Kelas</label>
                    <select value={form.kelas} onChange={e => setForm(f => ({ ...f, kelas: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)' }}>
                      {KELAS_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Hari</label>
                    <select value={form.hari} onChange={e => setForm(f => ({ ...f, hari: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)' }}>
                      {HARI.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Jam Mulai</label>
                    <input type="time" value={form.jamMulai} onChange={e => setForm(f => ({ ...f, jamMulai: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Jam Selesai</label>
                    <input type="time" value={form.jamSelesai} onChange={e => setForm(f => ({ ...f, jamSelesai: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Mata Pelajaran</label>
                  <select value={form.mataPelajaran} onChange={e => setForm(f => ({ ...f, mataPelajaran: e.target.value }))} required
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)' }}>
                    <option value="">-- Pilih Mata Pelajaran --</option>
                    {mapelOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Guru</label>
                  <select value={form.guru} onChange={e => setForm(f => ({ ...f, guru: e.target.value }))} required
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)' }}>
                    <option value="">-- Pilih Guru --</option>
                    {GURU_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Ruangan</label>
                  <input value={form.ruangan} onChange={e => setForm(f => ({ ...f, ruangan: e.target.value }))}
                    placeholder="cth: Ruang 401" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)' }} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="btn-primary flex-1" onClick={handleSave}><Save size={16} /> Simpan</button>
                <button className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Batal</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--foreground)' }}>Hapus Jadwal?</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{deleteItem.mataPelajaran} — {deleteItem.hari} {deleteItem.jamMulai}</p>
              <div className="flex gap-3">
                <button className="btn-danger flex-1" onClick={handleDelete}>Ya, Hapus</button>
                <button className="btn-secondary flex-1" onClick={() => setDeleteItem(null)}>Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
