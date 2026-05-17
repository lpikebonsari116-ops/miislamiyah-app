'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Calendar, Plus, Edit2, Trash2, X, Save, Search, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getTahunAjaranList,
  addTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
  getCurrentTahunAjaran,
  setCurrentTahunAjaran,
  getCurrentSemester,
  setCurrentSemester,
  TahunAjaran,
  Semester
} from '@/utils/tahunAjaran';

export default function TahunAjaranPage() {
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [currentTahunAjaran, setCurrentTahunAjaranState] = useState<TahunAjaran | null>(null);
  const [currentSemester, setCurrentSemesterState] = useState<Semester>('Ganjil');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<TahunAjaran | null>(null);
  const [deleteItem, setDeleteItem] = useState<TahunAjaran | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    nama: '',
    mulai: '',
    selesai: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif'
  });

  const loadData = () => {
    setTahunAjaranList(getTahunAjaranList());
    setCurrentTahunAjaranState(getCurrentTahunAjaran());
    setCurrentSemesterState(getCurrentSemester());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredList = tahunAjaranList.filter(ta =>
    ta.nama.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.nama || !form.mulai || !form.selesai) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (editItem) {
      updateTahunAjaran(editItem.id, form);
      toast.success('Tahun ajaran berhasil diperbarui');
    } else {
      addTahunAjaran(form);
      toast.success('Tahun ajaran baru berhasil ditambahkan');
    }

    loadData();
    setShowAddModal(false);
    setEditItem(null);
    resetForm();
  };

  const handleSetActive = (tahunAjaran: TahunAjaran) => {
    setCurrentTahunAjaran(tahunAjaran.id);
    updateTahunAjaran(tahunAjaran.id, { status: 'Aktif' });
    tahunAjaranList.forEach(ta => {
      if (ta.id !== tahunAjaran.id) {
        updateTahunAjaran(ta.id, { status: 'Nonaktif' });
      }
    });
    toast.success(`Tahun ajaran ${tahunAjaran.nama} diaktifkan`);
    loadData();
  };

  const handleSetSemester = (semester: Semester) => {
    setCurrentSemester(semester);
    setCurrentSemesterState(semester);
    toast.success(`Semester ${semester} dipilih`);
  };

  const handleDelete = () => {
    if (deleteItem) {
      deleteTahunAjaran(deleteItem.id);
      toast.success('Tahun ajaran berhasil dihapus');
      setDeleteItem(null);
      loadData();
    }
  };

  const resetForm = () => {
    setForm({
      nama: '',
      mulai: '',
      selesai: '',
      status: 'Aktif'
    });
  };

  const openAdd = () => {
    resetForm();
    setEditItem(null);
    setShowAddModal(true);
  };

  const openEdit = (tahunAjaran: TahunAjaran) => {
    setForm({
      nama: tahunAjaran.nama,
      mulai: tahunAjaran.mulai,
      selesai: tahunAjaran.selesai,
      status: tahunAjaran.status
    });
    setEditItem(tahunAjaran);
    setShowAddModal(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
              <Calendar size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Tahun Ajaran & Semester</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                Kelola tahun ajaran dan semester aktif
              </p>
            </div>
          </div>
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Tambah Tahun Ajaran
          </button>
        </div>

        {/* Current Settings Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-elevated p-5">
            <div className="flex items-center gap-3 mb-4">
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              <h2 className="font-bold">Tahun Ajaran Aktif</h2>
            </div>
            {currentTahunAjaran ? (
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--primary-light)' }}>
                <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{currentTahunAjaran.nama}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {currentTahunAjaran.mulai} - {currentTahunAjaran.selesai}
                </p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Belum ada tahun ajaran aktif</p>
            )}
          </div>
          <div className="card-elevated p-5">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
              <h2 className="font-bold">Semester Aktif</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSetSemester('Ganjil')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  currentSemester === 'Ganjil' ? 'text-white shadow-md' : 'border hover:border-primary'
                }`}
                style={
                  currentSemester === 'Ganjil'
                    ? { backgroundColor: 'var(--primary)' }
                    : { borderColor: 'var(--border)', color: 'var(--foreground)' }
                }
              >
                Ganjil
              </button>
              <button
                onClick={() => handleSetSemester('Genap')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  currentSemester === 'Genap' ? 'text-white shadow-md' : 'border hover:border-primary'
                }`}
                style={
                  currentSemester === 'Genap'
                    ? { backgroundColor: 'var(--primary)' }
                    : { borderColor: 'var(--border)', color: 'var(--foreground)' }
                }
              >
                Genap
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
            <Search size={15} className="text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari tahun ajaran..."
              className="bg-transparent text-sm outline-none w-full"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={14} className="text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Daftar Tahun Ajaran */}
        <div className="card-elevated overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {filteredList.length} Tahun Ajaran
            </span>
          </div>
          {filteredList.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar size={48} className="mx-auto mb-4" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
              <p className="font-semibold" style={{ color: 'var(--muted-foreground)' }}>Belum ada tahun ajaran</p>
              <button onClick={openAdd} className="btn-primary text-sm mt-4">
                <Plus size={14} /> Tambah Tahun Ajaran
              </button>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredList.map(tahunAjaran => (
                <div key={tahunAjaran.id} className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
                      <Calendar size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold" style={{ color: 'var(--foreground)' }}>{tahunAjaran.nama}</p>
                        {tahunAjaran.status === 'Aktif' && (
                          <span className="badge-active">Aktif</span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {tahunAjaran.mulai} - {tahunAjaran.selesai}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {tahunAjaran.status !== 'Aktif' && (
                      <button
                        onClick={() => handleSetActive(tahunAjaran)}
                        className="btn-primary text-sm px-3 py-1.5"
                      >
                        Aktifkan
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(tahunAjaran)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      style={{ color: 'var(--primary)' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteItem(tahunAjaran)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  {editItem ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Nama Tahun Ajaran *</label>
                  <input
                    value={form.nama}
                    onChange={e => setForm({ ...form, nama: e.target.value })}
                    placeholder="Contoh: 2025/2026"
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Tanggal Mulai *</label>
                    <input
                      type="date"
                      value={form.mulai}
                      onChange={e => setForm({ ...form, mulai: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Tanggal Selesai *</label>
                    <input
                      type="date"
                      value={form.selesai}
                      onChange={e => setForm({ ...form, selesai: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as 'Aktif' | 'Nonaktif' })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button className="btn-primary flex-1" onClick={handleSave}>
                    <Save size={16} /> Simpan
                  </button>
                  <button className="btn-secondary flex-1" onClick={() => setShowAddModal(false)}>
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--foreground)' }}>Hapus Tahun Ajaran?</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{deleteItem.nama}</p>
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
