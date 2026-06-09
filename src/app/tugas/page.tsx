'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/utils/supabase';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Assignment {
  id: string;
  kelas: string;
  judul: string;
  deskripsi: string | null;
  mata_pelajaran: string;
  tanggal_diberi: string;
  tenggat_waktu: string;
  guru: string | null;
}

export default function TugasPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    kelas: '',
    judul: '',
    deskripsi: '',
    mata_pelajaran: '',
    tanggal_diberi: '',
    tenggat_waktu: '',
    guru: ''
  });

  const fetchAssignments = async () => {
    setLoading(true);
    let query = supabase.from('assignments').select('*').order('tenggat_waktu', { ascending: true });

    if (selectedClass) {
      query = query.eq('kelas', selectedClass);
    }

    const { data, error } = await query;
    if (!error && data) setAssignments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, [selectedClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase.from('assignments').update(formData).eq('id', editingId);
      if (!error) {
        resetForm();
        fetchAssignments();
      }
    } else {
      const { error } = await supabase.from('assignments').insert(formData);
      if (!error) {
        resetForm();
        fetchAssignments();
      }
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setFormData({
      kelas: assignment.kelas,
      judul: assignment.judul,
      deskripsi: assignment.deskripsi || '',
      mata_pelajaran: assignment.mata_pelajaran,
      tanggal_diberi: assignment.tanggal_diberi,
      tenggat_waktu: assignment.tenggat_waktu,
      guru: assignment.guru || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus tugas ini?')) return;
    await supabase.from('assignments').delete().eq('id', id);
    fetchAssignments();
  };

  const resetForm = () => {
    setFormData({
      kelas: '',
      judul: '',
      deskripsi: '',
      mata_pelajaran: '',
      tanggal_diberi: '',
      tenggat_waktu: '',
      guru: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const classes = [...new Set(assignments.map(a => a.kelas))];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Tugas / PR</h1>
            <p className="text-sm text-gray-500">Kelola tugas dan PR siswa</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Tambah Tugas
          </button>
        </div>

        {/* Filter */}
        <div className="card-elevated p-4">
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="border rounded-lg px-3 py-2">
            <option value="">Semua Kelas</option>
            {classes.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card-elevated p-6">
            <h3 className="font-semibold mb-4">{editingId ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Kelas (cth: 4A)" value={formData.kelas} onChange={e => setFormData({ ...formData, kelas: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <input type="text" placeholder="Judul Tugas" value={formData.judul} onChange={e => setFormData({ ...formData, judul: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <input type="text" placeholder="Mata Pelajaran" value={formData.mata_pelajaran} onChange={e => setFormData({ ...formData, mata_pelajaran: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <input type="date" value={formData.tanggal_diberi} onChange={e => setFormData({ ...formData, tanggal_diberi: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <input type="date" value={formData.tenggat_waktu} onChange={e => setFormData({ ...formData, tenggat_waktu: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <input type="text" placeholder="Nama Guru" value={formData.guru} onChange={e => setFormData({ ...formData, guru: e.target.value })} className="border rounded-lg px-3 py-2" />
              <textarea placeholder="Deskripsi Tugas" value={formData.deskripsi} onChange={e => setFormData({ ...formData, deskripsi: e.target.value })} className="md:col-span-2 border rounded-lg px-3 py-2" rows={3} />
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex items-center gap-2"><Save size={16} /> Simpan</button>
                <button type="button" onClick={resetForm} className="btn-secondary">Batal</button>
              </div>
            </form>
          </div>
        )}

        {/* Tabel Tugas */}
        <div className="card-elevated overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold">Daftar Tugas</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">Memuat data...</div>
          ) : assignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada tugas.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3">Kelas</th>
                  <th className="text-left px-5 py-3">Judul</th>
                  <th className="text-left px-5 py-3">Mapel</th>
                  <th className="text-left px-5 py-3">Tenggat</th>
                  <th className="text-left px-5 py-3">Guru</th>
                  <th className="text-center px-5 py-3 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assignments.map(a => (
                  <tr key={a.id}>
                    <td className="px-5 py-3 font-medium">{a.kelas}</td>
                    <td className="px-5 py-3">{a.judul}</td>
                    <td className="px-5 py-3 text-sm">{a.mata_pelajaran}</td>
                    <td className="px-5 py-3 text-sm">{a.tenggat_waktu}</td>
                    <td className="px-5 py-3 text-sm">{a.guru}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(a)} className="text-blue-600"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(a.id)} className="text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}