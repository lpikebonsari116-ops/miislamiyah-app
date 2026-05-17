'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, Plus, Edit2, Trash2, X, Save, Search, User, BookOpen, GraduationCap, Phone, Mail, MapPin, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import { getGuruList, addGuru, updateGuru, deleteGuru, Guru, JabatanGuru } from '@/utils/guru';
import { getMapelList } from '@/utils/mapel';

const JABATAN: JabatanGuru[] = ['Guru Kelas', 'Guru Mapel', 'Guru Ummi'];

const getJabatanColor = (jabatan: JabatanGuru) => {
  switch (jabatan) {
    case 'Guru Kelas': return { bg: '#dbeafe', color: '#1e40af', label: 'Kelas' };
    case 'Guru Mapel': return { bg: '#dcfce7', color: '#166534', label: 'Mapel' };
    case 'Guru Ummi': return { bg: '#fef3c7', color: '#92400e', label: 'Ummi' };
  }
};

export default function DataGuruPage() {
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [activeTab, setActiveTab] = useState<JabatanGuru | 'Semua'>('Semua');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGuru, setEditGuru] = useState<Guru | null>(null);
  const [deleteGuruItem, setDeleteGuruItem] = useState<Guru | null>(null);
  const [form, setForm] = useState({
    nama: '', nip: '', jabatan: 'Guru Kelas' as JabatanGuru,
    kelas: '', mapel: [] as string[], noTelp: '', email: '',
    alamat: '', status: 'Aktif' as 'Aktif' | 'Nonaktif'
  });
  const [mapelOptions, setMapelOptions] = useState<string[]>([]);

  useEffect(() => {
    setGuruList(getGuruList());
    setMapelOptions(getMapelList());
  }, []);

  const loadGuru = () => {
    setGuruList(getGuruList());
  };

  const loadMapel = () => {
    setMapelOptions(getMapelList());
  };

  const filteredGuru = guruList.filter(guru => {
    const matchTab = activeTab === 'Semua' || guru.jabatan === activeTab;
    const matchSearch = guru.nama.toLowerCase().includes(search.toLowerCase()) ||
      (guru.nip && guru.nip.includes(search)) ||
      (guru.email && guru.email.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  });

  const handleSave = () => {
    if (!form.nama) {
      toast.error('Nama guru harus diisi');
      return;
    }

    if (editGuru) {
      updateGuru(editGuru.id, form);
      toast.success('Data guru berhasil diperbarui');
    } else {
      addGuru(form);
      toast.success('Guru baru berhasil ditambahkan');
    }

    loadGuru();
    setShowAddModal(false);
    setEditGuru(null);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteGuruItem) {
      deleteGuru(deleteGuruItem.id);
      toast.success('Data guru berhasil dihapus');
      setDeleteGuruItem(null);
      loadGuru();
    }
  };

  const resetForm = () => {
    setForm({
      nama: '', nip: '', jabatan: 'Guru Kelas',
      kelas: '', mapel: [], noTelp: '', email: '',
      alamat: '', status: 'Aktif'
    });
  };

  const openAdd = () => {
    resetForm();
    setEditGuru(null);
    loadMapel();
    setShowAddModal(true);
  };

  const openEdit = (guru: Guru) => {
    setForm({
      nama: guru.nama,
      nip: guru.nip || '',
      jabatan: guru.jabatan,
      kelas: guru.kelas || '',
      mapel: guru.mapel || [],
      noTelp: guru.noTelp || '',
      email: guru.email || '',
      alamat: guru.alamat || '',
      status: guru.status
    });
    setEditGuru(guru);
    loadMapel();
    setShowAddModal(true);
  };

  const GuruCard = ({ guru }: { guru: Guru }) => {
    const colors = getJabatanColor(guru.jabatan);
    return (
      <div className="card-elevated p-5 rounded-xl transition-all hover:shadow-card-hover">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: colors.bg, color: colors.color }}
          >
            <User size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--foreground)' }}>
                  {guru.nama}
                </h3>
                {guru.nip && (
                  <p className="text-xs font-mono mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    NIP: {guru.nip}
                  </p>
                )}
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                style={{ backgroundColor: colors.bg, color: colors.color }}
              >
                {colors.label}
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              {guru.kelas && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <GraduationCap size={12} />
                  <span>Wali Kelas {guru.kelas}</span>
                </div>
              )}
              {guru.mapel && guru.mapel.length > 0 && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <BookOpen size={12} />
                  <span>{guru.mapel.slice(0, 2).join(', ')}{guru.mapel.length > 2 ? ` +${guru.mapel.length - 2}` : ''}</span>
                </div>
              )}
              {guru.noTelp && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <Phone size={12} />
                  <span>{guru.noTelp}</span>
                </div>
              )}
              {guru.email && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <Mail size={12} />
                  <span className="truncate">{guru.email}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <span className={guru.status === 'Aktif' ? 'badge-active' : 'badge-inactive'}>
                {guru.status}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(guru)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  style={{ color: 'var(--primary)' }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteGuruItem(guru)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
              <Users size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Data Guru</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {guruList.length} guru · {guruList.filter(g => g.status === 'Aktif').length} aktif
              </p>
            </div>
          </div>
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Tambah Guru
          </button>
        </div>

        {/* Search & Filter */}
        <div className="card-elevated p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px]"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
              <Search size={15} className="text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama, NIP, atau email..."
                className="bg-transparent text-sm outline-none w-full"
                style={{ fontFamily: 'var(--font-sans)' }}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X size={14} className="text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
              <button
                onClick={() => setActiveTab('Semua')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'Semua' ? 'text-white shadow-md' : 'hover:bg-gray-100'}`}
                style={activeTab === 'Semua' ? { backgroundColor: 'var(--primary)' } : { color: 'var(--foreground)' }}
              >
                Semua
              </button>
              {JABATAN.map(jabatan => {
                const colors = getJabatanColor(jabatan);
                return (
                  <button
                    key={jabatan}
                    onClick={() => setActiveTab(jabatan)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all`}
                    style={
                      activeTab === jabatan
                        ? { backgroundColor: colors.bg, color: colors.color, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                        : { color: 'var(--muted-foreground)' }
                    }
                  >
                    {jabatan.split(' ')[1]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card-elevated p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{guruList.length}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Total Guru</p>
          </div>
          {JABATAN.map(jabatan => {
            const colors = getJabatanColor(jabatan);
            const count = guruList.filter(g => g.jabatan === jabatan && g.status === 'Aktif').length;
            return (
              <div key={jabatan} className="card-elevated p-4 text-center">
                <p className="text-3xl font-bold" style={{ color: colors.color }}>{count}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{jabatan}</p>
              </div>
            );
          })}
        </div>

        {/* Guru List */}
        {filteredGuru.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <User size={48} className="mx-auto mb-4" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
            <p className="font-semibold" style={{ color: 'var(--muted-foreground)' }}>Tidak ada guru ditemukan</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {search ? 'Coba ubah pencarian Anda' : 'Tambahkan guru baru untuk memulai'}
            </p>
            {!search && (
              <button onClick={openAdd} className="btn-primary text-sm mt-4">
                <Plus size={14} /> Tambah Guru
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredGuru.map(guru => (
              <GuruCard key={guru.id} guru={guru} />
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  {editGuru ? 'Edit Data Guru' : 'Tambah Guru Baru'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Nama Lengkap *</label>
                    <input
                      value={form.nama}
                      onChange={e => setForm({ ...form, nama: e.target.value })}
                      placeholder="Contoh: Ibu Siti Nurhaliza, S.Pd"
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>NIP</label>
                    <input
                      value={form.nip}
                      onChange={e => setForm({ ...form, nip: e.target.value })}
                      placeholder="198503152010012001"
                      className="w-full px-3 py-2 rounded-lg border text-sm font-mono"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Jabatan *</label>
                    <select
                      value={form.jabatan}
                      onChange={e => setForm({ ...form, jabatan: e.target.value as JabatanGuru })}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {JABATAN.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </div>
                  {form.jabatan === 'Guru Kelas' && (
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Kelas</label>
                      <select
                        value={form.kelas}
                        onChange={e => setForm({ ...form, kelas: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'].map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                  )}
                  {form.jabatan !== 'Guru Kelas' && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Mata Pelajaran</label>
                      {mapelOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4 text-center" style={{ border: '1px dashed var(--border)', borderRadius: '0.5rem' }}>
                          Belum ada mata pelajaran. Silakan tambahkan di halaman Mata Pelajaran.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {mapelOptions.map(mapel => (
                            <button
                              key={mapel}
                              type="button"
                              onClick={() => {
                                const newMapel = form.mapel.includes(mapel)
                                  ? form.mapel.filter(m => m !== mapel)
                                  : [...form.mapel, mapel];
                                setForm({ ...form, mapel: newMapel });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                form.mapel.includes(mapel)
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-border hover:border-primary'
                              }`}
                              style={
                                form.mapel.includes(mapel)
                                  ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary)' }
                                  : { borderColor: 'var(--border)', color: 'var(--foreground)' }
                              }
                            >
                              {mapel}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>No. Telepon</label>
                    <input
                      value={form.noTelp}
                      onChange={e => setForm({ ...form, noTelp: e.target.value })}
                      placeholder="0812-3456-7890"
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Email</label>
                    <input
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="nama@mi-islamiyah.sch.id"
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Alamat</label>
                    <textarea
                      value={form.alamat}
                      onChange={e => setForm({ ...form, alamat: e.target.value })}
                      placeholder="Jl. Contoh No. 123, Malang"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border)' }}
                    />
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
        {deleteGuruItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--foreground)' }}>Hapus Guru?</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{deleteGuruItem.nama}</p>
              <div className="flex gap-3">
                <button className="btn-danger flex-1" onClick={handleDelete}>Ya, Hapus</button>
                <button className="btn-secondary flex-1" onClick={() => setDeleteGuruItem(null)}>Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
