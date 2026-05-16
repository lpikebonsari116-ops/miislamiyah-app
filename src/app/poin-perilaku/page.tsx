'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import {
  Star,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  User,
  BookOpen,
  Award,
  Loader2,
} from 'lucide-react';
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
  group_name?: string;
}

interface SupabaseBehaviorLog {
  id: string;
  student_id: string;
  date: string;
  points: number;
  students: { nama: string; kelas: string } | null;
  behavior_categories: { name: string; type: string } | null;
}

export default function PoinPerilakuPage() {
  const [entries, setEntries] = useState<PoinEntry[]>([]);
  const [categories, setCategories] = useState<BehaviorCategory[]>([]);
  const [students, setStudents] = useState<{ id: string; nama: string; kelas: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua');

  // Form state
  const [formSiswa, setFormSiswa] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formKeterangan, setFormKeterangan] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch Categories
      const { data: catData } = await supabase.from('behavior_categories').select('*');
      if (catData) setCategories(catData as BehaviorCategory[]);

      // Fetch Students
      const { data: stuData } = await supabase
        .from('students')
        .select('id, nama, kelas')
        .eq('status', 'Aktif');
      if (stuData) setStudents(stuData);

      // Fetch Logs
      const { data: logsData } = await supabase
        .from('behavior_logs')
        .select(
          `
          *,
          students (nama, kelas),
          behavior_categories (name, type)
        `
        )
        .order('created_at', { ascending: false });

      if (logsData) {
        const mapped: PoinEntry[] = (logsData as unknown as SupabaseBehaviorLog[]).map((l) => ({
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
    } catch (_error: unknown) {
      console.error('Error fetching data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedCategory = categories.find((c) => c.id === formCategoryId);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchSearch =
        e.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
        e.perilaku.toLowerCase().includes(search.toLowerCase());
      const matchJenis = filterJenis === 'Semua' || e.jenis === filterJenis;
      return matchSearch && matchJenis;
    });
  }, [entries, search, filterJenis]);

  const totalPositif = useMemo(
    () =>
      entries
        .filter((e) => e.jenis === 'positif')
        .reduce((acc, curr) => acc + curr.poin, 0),
    [entries]
  );
  const totalNegatif = useMemo(
    () =>
      entries
        .filter((e) => e.jenis === 'negatif')
        .reduce((acc, curr) => acc + curr.poin, 0),
    [entries]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formSiswa || !formCategoryId) {
      toast.error('Pilih siswa dan kategori');
      return;
    }

    try {
      setIsSaving(true);

      const { error: logError } = await supabase.from('behavior_logs').insert({
        student_id: formSiswa,
        category_id: formCategoryId,
        date: formTanggal,
        notes: formKeterangan,
        points: selectedCategory?.points || 0,
      });

      if (logError) throw logError;

      // Update student total_poin
      const { data: student } = await supabase
        .from('students')
        .select('total_poin')
        .eq('id', formSiswa)
        .single();
      const currentPoin = (student as { total_poin: number } | null)?.total_poin || 0;

      await supabase
        .from('students')
        .update({
          total_poin: currentPoin + (selectedCategory?.points || 0),
        })
        .eq('id', formSiswa);

      toast.success('Poin berhasil dicatat');
      setShowForm(false);
      fetchData();
    } catch (_error: unknown) {
      console.error('Error saving poin');
      toast.error('Gagal mencatat poin');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        'Hapus entri ini? Poin siswa tidak akan otomatis kembali (manual update required for now).'
      )
    )
      return;

    try {
      const { error } = await supabase.from('behavior_logs').delete().eq('id', id);
      if (error) throw error;
      toast.success('Entri dihapus');
      fetchData();
    } catch (_error: unknown) {
      toast.error('Gagal menghapus entri');
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Sistem Poin Perilaku
            </h1>
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
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-3 text-green-600 mb-2">
              <TrendingUp size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Positif
              </span>
            </div>
            <div className="text-2xl font-black">+{totalPositif}</div>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <TrendingDown size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Negatif
              </span>
            </div>
            <div className="text-2xl font-black">-{totalNegatif}</div>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <Star size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Net Poin
              </span>
            </div>
            <div className="text-2xl font-black">{totalPositif - totalNegatif}</div>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-3 text-purple-600 mb-2">
              <User size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Catatan
              </span>
            </div>
            <div className="text-2xl font-black">{entries.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari siswa atau perilaku..."
              className="w-full bg-background border border-input rounded-lg pl-10 pr-4 py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              className="flex-1 sm:w-40 bg-background border border-input rounded-lg px-3 py-2 text-sm"
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="Semua">Semua Jenis</option>
              <option value="positif">Hanya Positif</option>
              <option value="negatif">Hanya Negatif</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="font-medium">Memuat data poin...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p>Belum ada catatan poin perilaku</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="p-4 font-bold">Tanggal</th>
                    <th className="p-4 font-bold">Siswa</th>
                    <th className="p-4 font-bold">Kelas</th>
                    <th className="p-4 font-bold">Perilaku</th>
                    <th className="p-4 font-bold">Jenis</th>
                    <th className="p-4 font-bold">Poin</th>
                    <th className="p-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((entry) => (
                    <tr key={entry.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        {new Date(entry.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4 font-bold">{entry.namaSiswa}</td>
                      <td className="p-4">{entry.kelas}</td>
                      <td className="p-4">
                        <div className="font-medium">{entry.perilaku}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            entry.jenis === 'positif'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {entry.jenis === 'positif' ? (
                            <CheckCircle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {entry.kategori}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-lg font-black ${
                            entry.jenis === 'positif' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {entry.jenis === 'positif' ? '+' : '-'}
                          {entry.poin}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">Input Poin Perilaku</h3>
                    <p className="text-xs text-muted-foreground">Catat prestasi atau pelanggaran siswa</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <XCircle size={24} className="text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Pilih Siswa
                  </label>
                  <select
                    required
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formSiswa}
                    onChange={(e) => setFormSiswa(e.target.value)}
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.kelas})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Kategori Perilaku
                  </label>
                  <select
                    required
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.type === 'Kebaikan' ? '+' : '-'}] {c.name} ({c.points} Poin)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formTanggal}
                      onChange={(e) => setFormTanggal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Poin Terhitung
                    </label>
                    <div className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-black text-primary">
                      {selectedCategory ? (selectedCategory.type === 'Kebaikan' ? '+' : '-') : ''}
                      {selectedCategory?.points || 0}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Keterangan (Opsional)
                  </label>
                  <textarea
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                    placeholder="Contoh: Membantu merapikan perpustakaan..."
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-3 border border-border rounded-xl font-bold hover:bg-secondary transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-2 bg-primary text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={20} className="animate-spin" /> Menyimpan...
                      </>
                    ) : (
                      <>Simpan Catatan</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
