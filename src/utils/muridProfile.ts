import { supabase } from './supabase';

export interface Kehadiran {
  id: string;
  siswaId: string;
  tanggal: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';
  keterangan?: string;
}

export interface PoinPerilaku {
  id: string;
  siswaId: string;
  tanggal: string;
  poin: number;
  keterangan: string;
  jenis: 'Tambah' | 'Kurang';
}

export interface AktivitasKelas {
  id: string;
  kelas: string;
  tanggal: string;
  judul: string;
  keterangan: string;
  jenis: 'Pembelajaran' | 'Ekstrakurikuler' | 'Kegiatan';
}

const KEHADIRAN_KEY = 'sukma_kehadiran_list';
const POIN_KEY = 'sukma_poin_list';
const AKTIVITAS_KEY = 'sukma_aktivitas_list';

const DEFAULT_KEHADIRAN: Kehadiran[] = [
  { id: 'h-1', siswaId: 'siswa-001', tanggal: '17/05/2025', status: 'Hadir' },
  { id: 'h-2', siswaId: 'siswa-001', tanggal: '16/05/2025', status: 'Hadir' },
  { id: 'h-3', siswaId: 'siswa-001', tanggal: '15/05/2025', status: 'Sakit', keterangan: 'Demam' },
  { id: 'h-4', siswaId: 'siswa-001', tanggal: '14/05/2025', status: 'Hadir' },
  { id: 'h-5', siswaId: 'siswa-001', tanggal: '13/05/2025', status: 'Izin', keterangan: 'Acara keluarga' },
];

const DEFAULT_POIN: PoinPerilaku[] = [
  { id: 'p-1', siswaId: 'siswa-001', tanggal: '17/05/2025', poin: 5, keterangan: 'Membantu teman belajar', jenis: 'Tambah' },
  { id: 'p-2', siswaId: 'siswa-001', tanggal: '15/05/2025', poin: 2, keterangan: 'Terlambat masuk kelas', jenis: 'Kurang' },
  { id: 'p-3', siswaId: 'siswa-001', tanggal: '13/05/2025', poin: 3, keterangan: 'Menyelesaikan tugas tepat waktu', jenis: 'Tambah' },
  { id: 'p-4', siswaId: 'siswa-001', tanggal: '10/05/2025', poin: 2, keterangan: 'Bersih-bersih kelas', jenis: 'Tambah' },
  { id: 'p-5', siswaId: 'siswa-001', tanggal: '08/05/2025', poin: 1, keterangan: 'Berbicara saat belajar', jenis: 'Kurang' },
  { id: 'p-6', siswaId: 'siswa-001', tanggal: '06/05/2025', poin: 5, keterangan: 'Juara lomba matematika', jenis: 'Tambah' },
  { id: 'p-7', siswaId: 'siswa-001', tanggal: '05/05/2025', poin: 2, keterangan: 'Menghafal doa harian', jenis: 'Tambah' },
];

const DEFAULT_AKTIVITAS: AktivitasKelas[] = [
  { id: 'a-1', kelas: '1A', tanggal: '17/05/2025', judul: 'Pembelajaran Matematika', keterangan: 'Belajar penjumlahan dan pengurangan', jenis: 'Pembelajaran' },
  { id: 'a-2', kelas: '1A', tanggal: '16/05/2025', judul: 'Olahraga Pagi', keterangan: 'Senam dan permainan lompat tali', jenis: 'Ekstrakurikuler' },
  { id: 'a-3', kelas: '1A', tanggal: '14/05/2025', judul: 'Praktik Sholat Dzuhur', keterangan: 'Praktik sholat berjamaah di masjid', jenis: 'Kegiatan' },
  { id: 'a-4', kelas: '1A', tanggal: '13/05/2025', judul: 'Kegiatan Membaca Al-Quran', keterangan: 'Tilawah bersama', jenis: 'Kegiatan' },
];

export async function getKehadiranList(): Promise<Kehadiran[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('kehadiran').select('*').order('tanggal', { ascending: false });
      if (error) {
        console.error('Supabase error fetching kehadiran:', error);
        return getLocalKehadiran();
      }
      if (data && data.length > 0) {
        return data.map(k => ({
          id: k.id,
          siswaId: k.siswa_id,
          tanggal: k.tanggal,
          status: k.status,
          keterangan: k.keterangan
        }));
      }
    }
  } catch (error) {
    console.error('Failed to get kehadiran from Supabase:', error);
  }
  return getLocalKehadiran();
}

export async function saveKehadiranList(list: Kehadiran[]): Promise<void> {
  try {
    if (supabase) {
      for (const k of list) {
        const { error } = await supabase.from('kehadiran').upsert({
          id: k.id,
          siswa_id: k.siswaId,
          tanggal: k.tanggal,
          status: k.status,
          keterangan: k.keterangan
        });
        if (error) console.error('Supabase error saving kehadiran:', error);
      }
    }
  } catch (error) {
    console.error('Failed to save kehadiran to Supabase:', error);
  }
  saveLocalKehadiran(list);
}

function getLocalKehadiran(): Kehadiran[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(KEHADIRAN_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_KEHADIRAN;
    }
    return DEFAULT_KEHADIRAN;
  } catch (error) {
    console.error('Failed to get local kehadiran list:', error);
    return DEFAULT_KEHADIRAN;
  }
}

function saveLocalKehadiran(list: Kehadiran[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEHADIRAN_KEY, JSON.stringify(list));
    }
  } catch (error) {
    console.error('Failed to save local kehadiran list:', error);
  }
}

export async function getPoinPerilakuList(): Promise<PoinPerilaku[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('poin_perilaku').select('*').order('tanggal', { ascending: false });
      if (error) {
        console.error('Supabase error fetching poin:', error);
        return getLocalPoin();
      }
      if (data && data.length > 0) {
        return data.map(p => ({
          id: p.id,
          siswaId: p.siswa_id,
          tanggal: p.tanggal,
          poin: p.poin,
          keterangan: p.keterangan,
          jenis: p.jenis
        }));
      }
    }
  } catch (error) {
    console.error('Failed to get poin from Supabase:', error);
  }
  return getLocalPoin();
}

export async function savePoinPerilakuList(list: PoinPerilaku[]): Promise<void> {
  try {
    if (supabase) {
      for (const p of list) {
        const { error } = await supabase.from('poin_perilaku').upsert({
          id: p.id,
          siswa_id: p.siswaId,
          tanggal: p.tanggal,
          poin: p.poin,
          keterangan: p.keterangan,
          jenis: p.jenis
        });
        if (error) console.error('Supabase error saving poin:', error);
      }
    }
  } catch (error) {
    console.error('Failed to save poin to Supabase:', error);
  }
  saveLocalPoin(list);
}

function getLocalPoin(): PoinPerilaku[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(POIN_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_POIN;
    }
    return DEFAULT_POIN;
  } catch (error) {
    console.error('Failed to get local poin list:', error);
    return DEFAULT_POIN;
  }
}

function saveLocalPoin(list: PoinPerilaku[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(POIN_KEY, JSON.stringify(list));
    }
  } catch (error) {
    console.error('Failed to save local poin list:', error);
  }
}

export async function getAktivitasKelasList(): Promise<AktivitasKelas[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('aktivitas_kelas').select('*').order('tanggal', { ascending: false });
      if (error) {
        console.error('Supabase error fetching aktivitas:', error);
        return getLocalAktivitas();
      }
      if (data && data.length > 0) {
        return data.map(a => ({
          id: a.id,
          kelas: a.kelas,
          tanggal: a.tanggal,
          judul: a.judul,
          keterangan: a.keterangan,
          jenis: a.jenis
        }));
      }
    }
  } catch (error) {
    console.error('Failed to get aktivitas from Supabase:', error);
  }
  return getLocalAktivitas();
}

export async function saveAktivitasKelasList(list: AktivitasKelas[]): Promise<void> {
  try {
    if (supabase) {
      for (const a of list) {
        const { error } = await supabase.from('aktivitas_kelas').upsert({
          id: a.id,
          kelas: a.kelas,
          tanggal: a.tanggal,
          judul: a.judul,
          keterangan: a.keterangan,
          jenis: a.jenis
        });
        if (error) console.error('Supabase error saving aktivitas:', error);
      }
    }
  } catch (error) {
    console.error('Failed to save aktivitas to Supabase:', error);
  }
  saveLocalAktivitas(list);
}

function getLocalAktivitas(): AktivitasKelas[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AKTIVITAS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_AKTIVITAS;
    }
    return DEFAULT_AKTIVITAS;
  } catch (error) {
    console.error('Failed to get local aktivitas list:', error);
    return DEFAULT_AKTIVITAS;
  }
}

function saveLocalAktivitas(list: AktivitasKelas[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AKTIVITAS_KEY, JSON.stringify(list));
    }
  } catch (error) {
    console.error('Failed to save local aktivitas list:', error);
  }
}

export async function getKehadiranBySiswa(siswaId: string): Promise<Kehadiran[]> {
  const list = await getKehadiranList();
  return list.filter(k => k.siswaId === siswaId);
}

export async function getPoinBySiswa(siswaId: string): Promise<PoinPerilaku[]> {
  const list = await getPoinPerilakuList();
  return list.filter(p => p.siswaId === siswaId);
}

export async function getAktivitasByKelas(kelas: string): Promise<AktivitasKelas[]> {
  const list = await getAktivitasKelasList();
  return list.filter(a => a.kelas === kelas);
}

export async function getTotalPoinBySiswa(siswaId: string): Promise<number> {
  const poinList = await getPoinBySiswa(siswaId);
  let total = 50;
  poinList.forEach(p => {
    total += p.jenis === 'Tambah' ? p.poin : -p.poin;
  });
  return total;
}

export async function getPresentaseKehadiran(siswaId: string): Promise<number> {
  const kehadiran = await getKehadiranBySiswa(siswaId);
  if (kehadiran.length === 0) return 100;
  const hadir = kehadiran.filter(k => k.status === 'Hadir').length;
  return Math.round((hadir / kehadiran.length) * 100);
}
