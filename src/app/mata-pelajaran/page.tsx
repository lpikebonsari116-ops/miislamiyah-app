'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Trash2, X, Save, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { getMapelList, saveMapelList, addMapel, deleteMapel } from '@/utils/mapel';

export default function MataPelajaranPage() {
  const [mapelList, setMapelList] = useState<string[]>([]);
  const [newMapel, setNewMapel] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setMapelList(getMapelList());
  }, []);

  const handleAddMapel = () => {
    if (!newMapel.trim()) return;
    if (mapelList.includes(newMapel.trim())) {
      toast.error('Mata pelajaran sudah ada');
      return;
    }
    addMapel(newMapel.trim());
    setMapelList(getMapelList());
    setNewMapel('');
    setShowAddModal(false);
    toast.success('Mata pelajaran berhasil ditambahkan');
  };

  const handleDeleteMapel = (mapel: string) => {
    deleteMapel(mapel);
    setMapelList(getMapelList());
    toast.success('Mata pelajaran berhasil dihapus');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
              <BookOpen size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Manajemen Mata Pelajaran</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                Kelola daftar mata pelajaran yang tersedia
              </p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Tambah Mata Pelajaran
          </button>
        </div>

        {/* Daftar Mata Pelajaran */}
        <div className="card-elevated overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {mapelList.length} Mata Pelajaran
            </span>
          </div>
          {mapelList.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Belum ada mata pelajaran
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {mapelList.map((mapel, index) => (
                <div key={mapel} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {index + 1}
                    </span>
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>{mapel}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMapel(mapel)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Tambah Mata Pelajaran</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Nama Mata Pelajaran</label>
                  <input
                    value={newMapel}
                    onChange={e => setNewMapel(e.target.value)}
                    placeholder="Contoh: Bahasa Jepang"
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border)' }}
                    onKeyDown={e => e.key === 'Enter' && handleAddMapel()}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button className="btn-primary flex-1" onClick={handleAddMapel}>
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
      </div>
    </AppLayout>
  );
}
