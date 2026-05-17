'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { Star, Plus, Search, Trash2, CheckCircle, XCircle, TrendingUp, TrendingDown, User, BookOpen, Award, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase';

interface PoinEntry {
  id: string;
  siswaId: string;
  namaSiswa: string;
  kelas: string;
  tanggal: string;
  kategori: string;
  perilaku: string;
  jenis: 'positif' | 'negatif';
  poin: number;
  dicatatOleh: string;
}

interface BehaviorCategory {
  id: string;
  name: string;
  points: number;
  type: 'Kebaikan' | 'Keburukan';
}

export default function PoinPerilakuPage() {
  const [entries, setEntries] = useState<PoinEntry[]>([]);
  const [categories, setCategories] = useState<BehaviorCategory[]>([]);
  const [students, setStudents] = useState<{id: string, nama: string, kelas: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState('Semua');

  // Form state
  const [formSiswa, setFormSiswa] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formKeterangan, setFormKeterangan] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch Categories
      const { data: catData } = await supabase.from('behavior_categories').select('*');
      if (catData) setCategories(catData);

      // Fetch Students
      const { data: stuData } = await supabase.from('students').select('id, nama, kelas').eq('status', 'Aktif');
      if (stuData) setStudents(stuData);

      // Fetch Logs
      const { data: logsData } = await supabase
        .from('behavior_logs')
        .select(`
          *,
          students (nama, kelas),
          behavior_categories (name, type)
        `)
        .order('created_at', { ascending: false });

      if (logsData) {
        const mapped: PoinEntry[] = logsData.map((l: any) => ({
          id: l.id,
          siswaId: l.student_id,
          namaSiswa: l.students?.nama || 'N/A',
          kelas: l.students?.kelas || 'N/A',
          tanggal: l.date,
          kategori: l.behavior_categories?.type === 'Kebaikan' ? 'Positif' : 'Negatif',
          perilaku: l.behavior_categories?.name || 'N/A',
          jenis: l.behavior_categories?.type === 'Kebaikan' ? 'positif' : 'negatif',
          poin: l.points,
          dicatatOleh: 'Guru', // Static for now
        }));
        setEntries(mapped);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === formCategoryId);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchSearch = e.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
        e.perilaku.toLowerCase().includes(search.toLowerCase());
      const matchJenis = filterJenis === 'Semua' || e.jenis === filterJenis;
      // Kategori filter might need adjustments if we want to filter by category name
      return matchSearch && matchJenis;
    });
  }, [entries, search, filterJenis]);

  const totalPositif = entries.filter(e => e.jenis === 'positif').reduce((s, e) => s + e.poin, 0);
  const totalNegatif = entries.filter(e => e.jenis === 'negatif').reduce((s, e) => s + e.poin, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formSiswa || !formCategoryId || !selectedCategory) return;

    try {
      setIsSaving(true);
      
      // 1. Insert Log
      const { error: logError } = await supabase.from('behavior_logs').insert([{
        student_id: formSiswa,
        category_id: formCategoryId,
        points: selectedCategory.points,
        date: formTanggal,
        keterangan: formKeterangan
      }]);

      if (logError) throw logError;

      // 2. Update Student Poin
      const { data: student } = await supabase.from('students').select('total_poin').eq('id', formSiswa).single();
      const currentPoin = student?.total_poin || 0;
      
      await supabase.from('students').update({
        total_poin: currentPoin + selectedCategory.points
      }).eq('id', formSiswa);

      toast.success('Poin berhasil dicatat');
      setShowForm(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving poin:', error.message);
      toast.error('Gagal mencatat poin');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus entri ini? Poin siswa tidak akan otomatis kembali (manual update required for now).')) return;
    
    try {
      const { error } = await supabase.from('behavior_logs').delete().eq('id', id);
      if (error) throw error;
      toast.success('Entri dihapus');
      fetchData();
    } catch (error: any) {
      toast.error('Gagal menghapus entri');
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Sistem Poin Perilaku</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Catat dan pantau poin perilaku siswa berdasarkan dokumen MI Islamiyah
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Input Poin Baru
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Entri', value: entries.length, icon: <BookOpen size={20} />, color: 'var(--info)', bg: 'var(--info-bg)' },
            { label: 'Poin Positif', value: `+${totalPositif}`, icon: <TrendingUp size={20} />, color: 'var(--success)', bg: 'var(--success-bg)' },
            { label: 'Poin Negatif', value: totalNegatif, icon: <TrendingDown size={20} />, color: 'var(--danger)', bg: 'var(--danger-bg)' },
            { label: 'Siswa Terlibat', value: new Set(entries.map(e => e.siswaId)).size, icon: <User size={20} />, color: 'var(--warning)', bg: 'var(--warning-bg)' },
          ].map((stat, i) => (
            <div key={i} className="card-elevated p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        {showForm && (
          <div className="card-elevated p-6">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Star size={18} style={{ color: 'var(--primary)' }} /> Form Input Poin Perilaku
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Tanggal</label>
                <input type="date" value={formTanggal} onChange={e => setFormTanggal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Siswa</label>
                <select value={formSiswa} onChange={e => setFormSiswa(e.target.value)} required
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }}>
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.nama} ({s.kelas})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Kategori & Perilaku</label>
                <select value={formCategoryId} onChange={e => setFormCategoryId(e.target.value)} required
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }}>
                  <option value="">-- Pilih Perilaku --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.type === 'Kebaikan' ? '✅' : '❌'} {c.name} ({c.points > 0 ? '+' : ''}{c.points})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Keterangan (Opsional)</label>
                <input type="text" value={formKeterangan} onChange={e => setFormKeterangan(e.target.value)} placeholder="Catatan tambahan..."
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }} />
              </div>
              {selectedCategory && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${selectedCategory.type === 'Kebaikan' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedCategory.type === 'Kebaikan' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    Poin: {selectedCategory.points > 0 ? '+' : ''}{selectedCategory.points} — {selectedCategory.type === 'Kebaikan' ? 'Perilaku Positif' : 'Pelanggaran'}
                  </div>
                </div>
              )}
              <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 
                  Simpan Poin
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
              </div>
            </form>
          </div>
        )}

        {/* Filters & Table */}
        <div className="card-elevated">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3" style={{ borderColor: 'var(--border)' }}>
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama siswa atau perilaku..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }} />
            </div>
            <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }}>
              <option value="Semua">Semua Jenis</option>
              <option value="positif">Positif</option>
              <option value="negatif">Negatif</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  {['Tanggal', 'Siswa', 'Kelas', 'Perilaku', 'Jenis', 'Poin', 'Dicatat Oleh', 'Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center"><Loader2 size={24} className="animate-spin mx-auto text-primary" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>Tidak ada data poin</td></tr>
                ) : filtered.map((entry, i) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{entry.tanggal}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{entry.namaSiswa}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{entry.kelas}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" style={{ color: 'var(--foreground)' }}>{entry.perilaku}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${entry.jenis === 'positif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {entry.jenis === 'positif' ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        {entry.jenis === 'positif' ? 'Positif' : 'Negatif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold" style={{ color: entry.poin > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {entry.poin > 0 ? '+' : ''}{entry.poin}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{entry.dicatatOleh}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors" style={{ color: 'var(--danger)' }} title="Hapus">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}>
            Menampilkan {filtered.length} dari {entries.length} entri
          </div>
        </div>

        {/* Behavior Reference */}
        <div className="card-elevated p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <Award size={18} style={{ color: 'var(--primary)' }} /> Referensi Poin Perilaku MI Islamiyah
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(new Set(categories.map(c => c.group_name))).map(group => (
              <div key={group} className="rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--primary)' }}>{group}</h3>
                <div className="space-y-1.5">
                  {categories.filter(c => c.group_name === group).map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-xs">
                      <span className="flex-1" style={{ color: 'var(--foreground)' }}>{item.name}</span>
                      <span className={`flex-shrink-0 font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.points > 0 ? '+' : ''}{item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
