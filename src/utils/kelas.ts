import { supabase } from './supabase';

export interface SiswaKelas {
  id: string;
  nis: string;
  nama: string;
}

export interface Kelas {
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

const DEFAULT_KELAS: Kelas[] = [
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

export async function getKelasList(): Promise<Kelas[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('kelas').select('*').order('nama_kelas');
      if (error) {
        console.error('Supabase error fetching kelas:', error);
        return getLocalKelas();
      }
      if (data && data.length > 0) {
        return data.map(k => ({
          id: k.id,
          namaKelas: k.nama_kelas,
          tingkat: k.tingkat,
          waliKelas: k.wali_kelas,
          ruangan: k.ruangan,
          tahunAjaran: k.tahun_ajaran,
          status: k.status,
          siswa: []
        }));
      }
    }
  } catch (error) {
    console.error('Failed to get kelas from Supabase:', error);
  }
  return getLocalKelas();
}

export async function saveKelasList(kelas: Kelas[]): Promise<void> {
  try {
    if (supabase) {
      for (const k of kelas) {
        const { error } = await supabase.from('kelas').upsert({
          id: k.id,
          nama_kelas: k.namaKelas,
          tingkat: k.tingkat,
          wali_kelas: k.waliKelas,
          ruangan: k.ruangan,
          tahun_ajaran: k.tahunAjaran,
          status: k.status
        });
        if (error) console.error('Supabase error saving kelas:', error);
      }
    }
  } catch (error) {
    console.error('Failed to save kelas to Supabase:', error);
  }
  saveLocalKelas(kelas);
}

function getLocalKelas(): Kelas[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(KELAS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_KELAS;
    }
    return DEFAULT_KELAS;
  } catch (error) {
    console.error('Failed to get local kelas list:', error);
    return DEFAULT_KELAS;
  }
}

function saveLocalKelas(kelas: Kelas[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KELAS_STORAGE_KEY, JSON.stringify(kelas));
    }
  } catch (error) {
    console.error('Failed to save local kelas list:', error);
  }
}
