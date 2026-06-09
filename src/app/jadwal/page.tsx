'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/utils/supabase';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Schedule {
  id: string;
  kelas: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  mata_pelajaran: string;
  guru: string;
}

export default function JadwalPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    kelas: '',
    hari: 'Senin',
    jam_mulai: '',
    jam_selesai: '',
    mata_pelajaran: '',
    guru: ''
  });

  const fetchSchedules = async () => {
    setLoading(true);
    let query = supabase.from('schedules').select('*').order('hari').order('jam_mulai');

    if (selectedClass) {
      query = query.eq('kelas', selectedClass);
    }

    const { data, error } = await query;
    if (!error && data) setSchedules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase.from('schedules').update(formData).eq('id', editingId);
      if (!error) {
        resetForm();
        fetchSchedules();
      }
    } else {
      const { error } = await supabase.from('schedules').insert(formData);
      if (!error) {
        resetForm();
        fetchSchedules();
      }
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setFormData({
      kelas: schedule.kelas,
      hari: schedule.hari,
      jam_mulai: schedule.jam_mulai,
      jam_selesai: schedule.jam_selesai,
      mata_pelajaran: schedule.mata_pelajaran,
      guru: schedule.guru
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
    await supabase.from('schedules').delete().eq('id', id);
    fetchSchedules();
  };

  const resetForm = () => {
    setFormData({
      kelas: '',
      hari: 'Senin',
      jam_mulai: '',
      jam_selesai: '',
      mata_pelajaran: '',
      guru: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const classes = [...new Set(schedules.map(s => s.kelas))];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Jadwal Pelajaran</h1>
            <p className="text-sm text-gray-500">Kelola jadwal pelajaran per kelas</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Tambah Jadwal
          </button>
        </div>

        {/* Filter */}
        <div className="card-elevated p-4">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded-lg px-3 py-2">
            <option value="">Semua Kelas</option>
            {classes.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card-elevated p-6">
            <h3 className="font-semibold mb-4">{editingId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Kelas (contoh: 1A)" value={formData.kelas} onChange={(e) => setFormData({ ...formData, kelas: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <select value={formData.hari} onChange={(e) => setFormData({ ...formData, hari: e.target.value })} className="border rounded-lg px-3 py-2">
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="time" value={formData.jam_mulai} onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <input type="time" value={formData.jam_selesai} onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <input type="text" placeholder="Mata Pelajaran" value={formData.mata_pelajaran} onChange={(e) => setFormData({ ...formData, mata_pelajaran: e.target.value })} className="border rounded-lg px-3 py-2" required />
              <input type="text" placeholder="Nama Guru" value={formData.guru} onChange={(e) => setFormData({ ...formData, guru: e.target.value })} className="border rounded-lg px-3 py-2" />
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex items-center gap-2"><Save size={16} /> Simpan</button>
                <button type="button" onClick={resetForm} className="btn-secondary">Batal</button>
              </div>
            </form>
          </div>
        )}

        {/* Tabel Jadwal */}
        <div className="card-elevated overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold">Daftar Jadwal</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">Memuat data...</div>
          ) : schedules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada jadwal.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3">Kelas</th>
                  <th className="text-left px-5 py-3">Hari</th>
                  <th className="text-left px-5 py-3">Jam</th>
                  <th className="text-left px-5 py-3">Mata Pelajaran</th>
                  <th className="text-left px-5 py-3">Guru</th>
                  <th className="text-center px-5 py-3 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 font-medium">{s.kelas}</td>
                    <td className="px-5 py-3">{s.hari}</td>
                    <td className="px-5 py-3">{s.jam_mulai} - {s.jam_selesai}</td>
                    <td className="px-5 py-3">{s.mata_pelajaran}</td>
                    <td className="px-5 py-3">{s.guru}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(s)} className="text-blue-600"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-600"><Trash2 size={16} /></button>
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