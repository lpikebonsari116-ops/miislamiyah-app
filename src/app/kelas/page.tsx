'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Edit2, Trash2, Users, BookOpen, X, Save, PlusCircle, MinusCircle, Eye, Search } from 'lucide-react';
import { getGuruList } from '@/utils/guru';
import { getStudentsList, saveStudentsList } from '@/utils/students';
import { Student } from '@/app/student-management/components/StudentManagementClient';

interface SiswaKelas {
  id: string;
  nis: string;
  nama: string;
}

interface Kelas {
  id: string;
  namaKelas: string;
  tingkat: number;
  waliKelas: string;
  ruangan: string;
  tahunAjaran: string;
  status: 'Aktif' | 'Tidak Aktif';
  siswa: SiswaKelas[];
}

const KELAS_STORAGE_KEY = 'sukma_kelas_list';

const getDefaultKelas = (): Kelas[] => [
  { id: 'k-1a', namaKelas: '1A', tingkat: 1, waliKelas: 'Ibu Laila Mufidah, S.Pd', ruangan: 'Ruang 101', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
  { id: 'k-1b', namaKelas: '1B', tingkat: 1, waliKelas: 'Ibu Khadijah Nur, S.Pd', ruangan: 'Ruang 102', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
  { id: 'k-2a', namaKelas: '2A', tingkat: 2, waliKelas: 'Pak Denny Firmansyah, S.Pd', ruangan: 'Ruang 201', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
  { id: 'k-2b', namaKelas: '2B', tingkat: 2, waliKelas: 'Ibu Khadijah Nur, S.Pd', ruangan: 'Ruang 202', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
  { id: 'k-3a', namaKelas: '3A', tingkat: 3, waliKelas: 'Ibu Nurul Hidayah, S.Pd', ruangan: 'Ruang 301', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
  { id: 'k-3b', namaKelas: '3B', tingkat: 3, waliKelas: 'Pak Rudi Hartono, S.Pd', ruangan: 'Ruang 302', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
  { id: 'k-4a', namaKelas: '4A', tingkat: 4, waliKelas: 'Ibu Sari Dewi, S.Pd', ruangan: 'Ruang 401', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
  { id: 'k-4b', namaKelas: '4B', tingkat: 4, waliKelas: 'Pak Ahmad Fauzi, S.Pd', ruangan: 'Ruang 402', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
  { id: 'k-5a', namaKelas: '5A', tingkat: 5, waliKelas: 'Ibu Rina Kusuma, S.Pd', ruangan: 'Ruang 501', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
  { id: 'k-5b', namaKelas: '5B', tingkat: 5, waliKelas: 'Pak Agus Wahyudi, S.Pd', ruangan: 'Ruang 502', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
  { id: 'k-6a', namaKelas: '6A', tingkat: 6, waliKelas: 'Ibu Fatimah Zahra, S.Pd', ruangan: 'Ruang 601', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
  { id: 'k-6b', namaKelas: '6B', tingkat: 6, waliKelas: 'Pak Yusuf Effendi, S.Pd', ruangan: 'Ruang 602', tahunAjaran: '2024/2025', status: 'Aktif', siswa: [] },
];

const getKelasList = (): Kelas[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(KELAS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : getDefaultKelas();
    }
    return getDefaultKelas();
  } catch {
    return getDefaultKelas();
  }
};

const saveKelasList = (kelas: Kelas[]): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KELAS_STORAGE_KEY, JSON.stringify(kelas));
    }
  } catch {}
};

const TINGKAT_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: '#dbeafe', color: '#1e40af' },
  2: { bg: '#dcfce7', color: '#166534' },
  3: { bg: '#fef3c7', color: '#92400e' },
  4: { bg: '#f3e8ff', color: '#6b21a8' },
  5: { bg: '#ffedd5', color: '#9a3412' },
  6: { bg: '#fee2e2', color: '#991b1b' },
};

interface FormState {
  namaKelas: string;
  tingkat: number;
  waliKelas: string;
  ruangan: string;
  tahunAjaran: string;
  status: 'Aktif' | 'Tidak Aktif';
}

const emptyForm: FormState = {
  namaKelas: '', tingkat: 1, waliKelas: '', ruangan: '', tahunAjaran: '2024/2025', status: 'Aktif',
};

export default function ManajemenKelasPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [guruOptions, setGuruOptions] = useState<string[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editKelas, setEditKelas] = useState<Kelas | null>(null);
  const [deleteKelas, setDeleteKelas] = useState<Kelas | null>(null);
  const [viewKelas, setViewKelas] = useState<Kelas | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [searchSiswa, setSearchSiswa] = useState('');

  useEffect(() => {
    setKelasList(getKelasList());
    
    let guruList: any[] = [];
    try {
      const result = getGuruList();
      guruList = Array.isArray(result) ? result : [];
    } catch {
      guruList = [];
    }
    setGuruOptions(guruList.map(g => g.nama));
    
    const studentsResult = getStudentsList();
    setAllStudents(Array.isArray(studentsResult) ? studentsResult : []);
  }, []);

  const totalSiswa = kelasList.reduce((s, k) => s + k.siswa.length, 0);
  const tingkatGroups = [1, 2, 3, 4, 5, 6];

  const availableStudents = (allStudents || []).filter((student: any) => {
    const isAlreadyInClass = (kelasList || []).some((kelas: any) =>
      (kelas.siswa || []).some((siswa: any) => siswa.nis === student.nis)
    );
    const matchesSearch =
      student.nama.toLowerCase().includes(searchSiswa.toLowerCase()) ||
      student.nis.includes(searchSiswa);
    return !isAlreadyInClass && matchesSearch;
  });

  function openAdd() {
    setEditKelas(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(kelas: Kelas) {
    setEditKelas(kelas);
    setForm({
      namaKelas: kelas.namaKelas, tingkat: kelas.tingkat, waliKelas: kelas.waliKelas,
      ruangan: kelas.ruangan, tahunAjaran: kelas.tahunAjaran, status: kelas.status,
    });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.namaKelas || !form.waliKelas || !form.ruangan) return;

    if (editKelas) {
      const updatedList = kelasList.map(k => k.id === editKelas.id ? { ...k, ...form } : k);
      setKelasList(updatedList);
      saveKelasList(updatedList);
    } else {
      const newKelas: Kelas = { id: `k-${Date.now()}`, ...form, siswa: [] };
      const updatedList = [...kelasList, newKelas];
      setKelasList(updatedList);
      saveKelasList(updatedList);
    }
    setShowModal(false);
  }

  function handleDelete() {
    if (!deleteKelas) return;
    const updatedList = kelasList.filter(k => k.id !== deleteKelas.id);
    setKelasList(updatedList);
    saveKelasList(updatedList);
    setDeleteKelas(null);
  }

  const addSiswaToKelas = (kelas: Kelas) => {
    if (!selectedSiswaId) return;
    const selectedStudent = allStudents.find(s => s.id === selectedSiswaId);
    if (!selectedStudent) return;

    const siswaBaru: SiswaKelas = {
      id: selectedStudent.id,
      nis: selectedStudent.nis,
      nama: selectedStudent.nama
    };

    const updatedList = kelasList.map(k => {
      if (k.id === kelas.id) {
        return { ...k, siswa: [...k.siswa, siswaBaru] };
      }
      return k;
    });
    setKelasList(updatedList);
    saveKelasList(updatedList);
    setViewKelas(updatedList.find(k => k.id === kelas.id) || null);
    setSelectedSiswaId('');
    setSearchSiswa('');
  };

  const removeSiswaFromKelas = (kelasId: string, siswaId: string) => {
    const updatedList = kelasList.map(k => {
      if (k.id === kelasId) {
        return { ...k, siswa: k.siswa.filter(s => s.id !== siswaId) };
      }
      return k;
    });
    setKelasList(updatedList);
    saveKelasList(updatedList);
    setViewKelas(updatedList.find(k => k.id === kelasId) || null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Kelas</h1>
            <p className="text-sm mt-1 text-gray-500">Kelola data kelas, wali kelas, dan siswa per kelas</p>
          </div>
          <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Tambah Kelas</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Kelas', value: kelasList.length, color: '#3b82f6' },
            { label: 'Total Siswa', value: totalSiswa, color: '#10b981' },
            { label: 'Kelas Aktif', value: kelasList.filter(k => k.status === 'Aktif').length, color: '#22c55e' },
            { label: 'Rata-rata/Kelas', value: kelasList.length > 0 ? Math.round(totalSiswa / kelasList.length) : 0, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} className="card-elevated p-4">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1 text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {tingkatGroups.map(tingkat => {
          const kelasInTingkat = kelasList.filter(k => k.tingkat === tingkat);
          if (kelasInTingkat.length === 0) return null;
          const tc = TINGKAT_COLORS[tingkat];
          return (
            <div key={tingkat}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: tc.bg, color: tc.color }}>
                  Kelas {tingkat}
                </span>
                <span className="text-xs text-gray-500">{kelasInTingkat.length} kelas</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {kelasInTingkat.map(kelas => (
                  <div key={kelas.id} className="card-elevated p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base" style={{ backgroundColor: tc.bg, color: tc.color }}>
                          {kelas.namaKelas}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Kelas {kelas.namaKelas}</p>
                          <p className="text-xs text-gray-500">{kelas.ruangan}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${kelas.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {kelas.status}
                      </span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Users size={11} className="text-gray-400" />
                        <span className="text-gray-500">Wali Kelas:</span>
                        <span className="font-medium truncate">{kelas.waliKelas}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <BookOpen size={11} className="text-gray-400" />
                        <span className="text-gray-500">Jumlah Siswa:</span>
                        <span className="font-bold text-blue-600">{kelas.siswa.length} siswa</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t">
                      <button onClick={() => setViewKelas(kelas)} className="flex-1 text-xs py-1.5 px-2 rounded-lg border hover:bg-gray-50"><Eye size={12} /></button>
                      <button onClick={() => openEdit(kelas)} className="flex-1 text-xs py-1.5 px-2 rounded-lg border hover:bg-gray-50"><Edit2 size={12} /></button>
                      <button onClick={() => setDeleteKelas(kelas)} className="flex-1 text-xs py-1.5 px-2 rounded-lg border hover:bg-red-50 text-red-600"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Modal Add/Edit */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">{editKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
                <button onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Nama Kelas</label>
                    <input value={form.namaKelas} onChange={e => setForm(f => ({ ...f, namaKelas: e.target.value }))} placeholder="cth: 4A" className="w-full px-3 py-2 rounded-lg border text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Tingkat</label>
                    <select value={form.tingkat} onChange={e => setForm(f => ({ ...f, tingkat: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border text-sm">
                      {[1,2,3,4,5,6].map(t => <option key={t} value={t}>Kelas {t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Wali Kelas</label>
                  <select value={form.waliKelas} onChange={e => setForm(f => ({ ...f, waliKelas: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm">
                    <option value="">-- Pilih Wali Kelas --</option>
                    {guruOptions.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Ruangan</label>
                    <input value={form.ruangan} onChange={e => setForm(f => ({ ...f, ruangan: e.target.value }))} placeholder="cth: Ruang 401" className="w-full px-3 py-2 rounded-lg border text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Tahun Ajaran</label>
                    <input value={form.tahunAjaran} onChange={e => setForm(f => ({ ...f, tahunAjaran: e.target.value }))} placeholder="2024/2025" className="w-full px-3 py-2 rounded-lg border text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'Aktif' | 'Tidak Aktif' }))} className="w-full px-3 py-2 rounded-lg border text-sm">
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="btn-primary flex-1" onClick={handleSave}><Save size={16} /> Simpan</button>
                <button className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Batal</button>
              </div>
            </div>
          </div>
        )}

        {/* View Siswa Modal */}
        {viewKelas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h2 className="text-lg font-bold">Daftar Siswa Kelas {viewKelas.namaKelas}</h2>
                  <p className="text-xs text-gray-500">{viewKelas.siswa.length} siswa · Wali Kelas: {viewKelas.waliKelas}</p>
                </div>
                <button onClick={() => setViewKelas(null)}><X size={18} /></button>
              </div>

              <div className="p-6 border-b bg-gray-50">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={searchSiswa} onChange={e => setSearchSiswa(e.target.value)} placeholder="Cari siswa..." className="w-full pl-10 pr-3 py-2 rounded-lg border text-sm" />
                  </div>
                  <select value={selectedSiswaId} onChange={e => setSelectedSiswaId(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border text-sm">
                    <option value="">-- Pilih Siswa --</option>
                    {availableStudents.map(student => (
                      <option key={student.id} value={student.id}>{student.nis} - {student.nama}</option>
                    ))}
                  </select>
                  <button onClick={() => addSiswaToKelas(viewKelas)} disabled={!selectedSiswaId} className="btn-primary px-4"><PlusCircle size={16} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {viewKelas.siswa.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500">Belum ada siswa di kelas ini</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {viewKelas.siswa.map((siswa, index) => (
                      <div key={siswa.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">{index + 1}</span>
                          <div>
                            <p className="font-medium text-sm">{siswa.nama}</p>
                            <p className="text-xs text-gray-500 font-mono">NIS: {siswa.nis}</p>
                          </div>
                        </div>
                        <button onClick={() => removeSiswaFromKelas(viewKelas.id, siswa.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><MinusCircle size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t">
                <button className="btn-secondary w-full" onClick={() => setViewKelas(null)}>Tutup</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteKelas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-1">Hapus Kelas {deleteKelas.namaKelas}?</h3>
              <p className="text-sm text-gray-500 mb-4">Semua data siswa di kelas ini juga akan dihapus.</p>
              <div className="flex gap-3">
                <button className="btn-danger flex-1" onClick={handleDelete}>Ya, Hapus</button>
                <button className="btn-secondary flex-1" onClick={() => setDeleteKelas(null)}>Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}