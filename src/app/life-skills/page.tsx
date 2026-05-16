'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { BookOpen, Save, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { toast } from 'sonner';

type LifeSkillValue = 'B' | 'C' | 'K' | '';

interface StudentRow {
  id: string;
  nama: string;
  kelas: string;
}

interface DailyRecord {
  [studentId: string]: {
    [day: string]: LifeSkillValue;
  };
}

interface SupabaseLifeSkillRecord {
  student_id: string;
  tanggal: string;
  nilai: string;
}

const KELAS_OPTIONS = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
const bulanOptions = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const tahunOptions = ['2024', '2025', '2026'];

const DAYS_OF_WEEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function getDaysInMonth(
  month: number,
  year: number
): { day: number; dayOfWeek: string; dateStr: string }[] {
  const days = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      day: d,
      dayOfWeek: DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1],
      dateStr,
    });
  }
  return days;
}

const VALUE_STYLES: Record<LifeSkillValue, { label: string; bg: string; color: string }> = {
  B: { label: 'B', bg: '#dcfce7', color: '#166534' },
  C: { label: 'C', bg: '#fef3c7', color: '#92400e' },
  K: { label: 'K', bg: '#fee2e2', color: '#991b1b' },
  '': { label: '-', bg: 'transparent', color: '#9ca3af' },
};

function cycleValue(current: LifeSkillValue): LifeSkillValue {
  const cycle: LifeSkillValue[] = ['', 'B', 'C', 'K'];
  const idx = cycle.indexOf(current);
  return cycle[(idx + 1) % cycle.length];
}

export default function LifeSkillsPage() {
  const [selectedKelas, setSelectedKelas] = useState('4A');
  const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear());
  const [siswaList, setSiswaList] = useState<StudentRow[]>([]);
  const [records, setRecords] = useState<DailyRecord>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const days = useMemo(
    () => getDaysInMonth(selectedBulan, selectedTahun),
    [selectedBulan, selectedTahun]
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // 1. Fetch Students
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, nama, kelas')
        .eq('kelas', selectedKelas)
        .eq('status', 'Aktif')
        .order('nama', { ascending: true });

      if (studentsData) setSiswaList(studentsData);

      // 2. Fetch Records for the month
      const startDate = `${selectedTahun}-${String(selectedBulan).padStart(2, '0')}-01`;
      const endDate = `${selectedTahun}-${String(selectedBulan).padStart(2, '0')}-${days.length}`;

      const { data: recordsData } = await supabase
        .from('life_skills_records')
        .select('*')
        .in('student_id', studentsData?.map((s) => s.id) || [])
        .gte('tanggal', startDate)
        .lte('tanggal', endDate);

      if (recordsData) {
        const initial: DailyRecord = (recordsData as unknown as SupabaseLifeSkillRecord[]).reduce(
          (acc, r) => {
            const d = new Date(r.tanggal).getDate();
            if (!acc[r.student_id]) acc[r.student_id] = {};
            acc[r.student_id][d] = r.nilai as LifeSkillValue;
            return acc;
          },
          {} as DailyRecord
        );
        setRecords(initial);
      }
    } catch (_error: unknown) {
      console.error('Error fetching data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedKelas, selectedBulan, selectedTahun, days.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const weeks: (typeof days)[] = useMemo(() => {
    const w: (typeof days)[] = [];
    for (let i = 0; i < days.length; i += 7) {
      w.push(days.slice(i, i + 7));
    }
    return w;
  }, [days]);

  function getRecord(studentId: string, day: number): LifeSkillValue {
    return records[studentId]?.[`${day}`] ?? '';
  }

  function toggleRecord(studentId: string, day: number) {
    const current = getRecord(studentId, day);
    const next = cycleValue(current);
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [`${day}`]: next },
    }));
    setSaved(false);
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      const upsertData = Object.entries(records).flatMap(([sId, daysObj]) =>
        Object.entries(daysObj as Record<string, LifeSkillValue>)
          .filter(([, val]) => val !== '')
          .map(([day, val]) => ({
            student_id: sId,
            tanggal: `${selectedTahun}-${String(selectedBulan).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            nilai: val,
          }))
      );

      if (upsertData.length > 0) {
        const { error } = await supabase.from('life_skills_records').upsert(upsertData, {
          onConflict: 'student_id, tanggal',
        });
        if (error) throw error;
      }

      setSaved(true);
      toast.success('Nilai life skills berhasil disimpan');
      setTimeout(() => setSaved(false), 2000);
    } catch (_error: unknown) {
      toast.error('Gagal menyimpan nilai');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Monitoring Life Skills
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Penilaian harian kemandirian dan keterampilan hidup siswa
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} /> Simpan Perubahan
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pilih Kelas
            </label>
            <select
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
            >
              {KELAS_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bulan
            </label>
            <select
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(Number(e.target.value))}
            >
              {bulanOptions.map((b, i) => (
                <option key={b} value={i + 1}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tahun
            </label>
            <select
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
            >
              {tahunOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-medium bg-secondary/50 p-3 rounded-lg border border-border">
          <span className="text-muted-foreground uppercase tracking-tight">Keterangan:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#dcfce7] border border-[#166534]/20" />
            <span>(B) Baik</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#fef3c7] border border-[#92400e]/20" />
            <span>(C) Cukup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#fee2e2] border border-[#991b1b]/20" />
            <span>(K) Kurang</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border border-dashed border-muted-foreground/30" />
            <span>Belum Dinilai</span>
          </div>
          <span className="ml-auto text-muted-foreground italic">Klik pada sel untuk mengubah nilai</span>
        </div>

        {/* Attendance Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="font-medium">Memuat data siswa...</p>
            </div>
          ) : siswaList.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
              <p>Tidak ada data siswa aktif di kelas ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="sticky left-0 z-10 bg-secondary/50 p-4 text-left font-bold w-12 border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                      #
                    </th>
                    <th className="sticky left-12 z-10 bg-secondary/50 p-4 text-left font-bold min-w-[200px] border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                      Nama Siswa
                    </th>
                    {weeks.map((week, wIdx) => (
                      <React.Fragment key={wIdx}>
                        {week.map((d) => (
                          <th key={d.day} className="p-2 text-center border-r border-border min-w-[45px]">
                            <div className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">
                              {d.dayOfWeek}
                            </div>
                            <div className="text-sm font-black">{d.day}</div>
                          </th>
                        ))}
                        {/* Weekly Divider */}
                        {wIdx < weeks.length - 1 && (
                          <th className="bg-border/30 w-1 min-w-[4px] p-0 border-r border-border" />
                        )}
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {siswaList.map((siswa, sIdx) => (
                    <tr key={siswa.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="sticky left-0 z-10 bg-card p-4 text-center font-medium border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.05)] text-muted-foreground">
                        {sIdx + 1}
                      </td>
                      <td className="sticky left-12 z-10 bg-card p-4 font-bold border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        {siswa.nama}
                      </td>
                      {weeks.map((week, wIdx) => (
                        <React.Fragment key={wIdx}>
                          {week.map((d) => {
                            const val = getRecord(siswa.id, d.day);
                            const style = VALUE_STYLES[val];
                            return (
                              <td
                                key={d.day}
                                className="p-1 border-r border-border"
                                onClick={() => toggleRecord(siswa.id, d.day)}
                              >
                                <div
                                  className="h-10 w-full rounded flex items-center justify-center cursor-pointer transition-all hover:scale-105 select-none font-black"
                                  style={{
                                    backgroundColor: style.bg,
                                    color: style.color,
                                    border: val ? `1px solid ${style.color}20` : '1px dashed transparent',
                                  }}
                                >
                                  {style.label}
                                </div>
                              </td>
                            );
                          })}
                          {/* Weekly Divider */}
                          {wIdx < weeks.length - 1 && (
                            <td className="bg-border/30 w-1 p-0 border-r border-border" />
                          )}
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Success Alert */}
        {saved && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce z-50">
            <CheckCircle size={20} />
            <span className="font-bold">Berhasil Disimpan!</span>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
