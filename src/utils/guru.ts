import { supabase } from './supabase';

const GURU_STORAGE_KEY = 'sukma_guru_list';

export type JabatanGuru = 'Guru Kelas' | 'Guru Mapel' | 'Guru Ummi';

export interface Guru {
  id: string;
  nama: string;
  nip?: string;
  jabatan: JabatanGuru;
  kelas?: string;
  mapel?: string[];
  noTelp?: string;
  email?: string;
  foto?: string;
  alamat?: string;
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
}

const DEFAULT_GURU: Guru[] = [
  { id: 'guru-001', nama: 'Ibu Sari Dewi, S.Pd', nip: '198503152010012001', jabatan: 'Guru Kelas', kelas: '4A', noTelp: '0812-3456-7890', email: 'sari.dewi@mi-islamiyah.sch.id', status: 'Aktif', createdAt: '2024-01-01' },
  { id: 'guru-002', nama: 'Ibu Nurul Hidayah, S.Pd', nip: '198708202012012002', jabatan: 'Guru Kelas', kelas: '3A', noTelp: '0823-4567-8901', email: 'nurul.hidayah@mi-islamiyah.sch.id', status: 'Aktif', createdAt: '2024-01-01' },
  { id: 'guru-003', nama: 'Pak Agus Wahyudi, S.Pd', nip: '198211102008011003', jabatan: 'Guru Mapel', mapel: ['Matematika', 'IPA'], noTelp: '0834-5678-9012', email: 'agus.wahyudi@mi-islamiyah.sch.id', status: 'Aktif', createdAt: '2024-01-01' },
  { id: 'guru-004', nama: 'Ibu Fatimah Zahra, S.Pd.I', nip: '198902282015012004', jabatan: 'Guru Ummi', mapel: ['Tahfidz', 'Al-Quran Hadits'], noTelp: '0845-6789-0123', email: 'fatimah.zahra@mi-islamiyah.sch.id', status: 'Aktif', createdAt: '2024-01-01' },
  { id: 'guru-005', nama: 'Pak Rudi Hartono, S.Pd', nip: '198406152010011005', jabatan: 'Guru Mapel', mapel: ['Penjaskes', 'SBdP'], noTelp: '0856-7890-1234', email: 'rudi.hartono@mi-islamiyah.sch.id', status: 'Aktif', createdAt: '2024-01-01' },
  { id: 'guru-006', nama: 'Ibu Khadijah Nur, S.Pd.I', nip: '199109202018012006', jabatan: 'Guru Ummi', mapel: ['Fiqih', 'Aqidah Akhlak'], noTelp: '0867-8901-2345', email: 'khadijah.nur@mi-islamiyah.sch.id', status: 'Aktif', createdAt: '2024-01-01' }
];

export async function getGuruList(): Promise<Guru[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('guru').select('*').order('nama');
      if (error) {
        console.error('Supabase error fetching guru:', error);
        return getLocalGuru();
      }
      if (data && data.length > 0) {
        return data.map(g => ({
          id: g.id,
          nama: g.nama,
          nip: g.nip,
          jabatan: g.jabatan,
          kelas: g.kelas_diampu,
          mapel: g.mapel_diampu,
          noTelp: g.no_telp,
          email: g.email,
          status: g.status_akun,
          createdAt: g.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
        }));
      }
    }
  } catch (error) {
    console.error('Failed to get guru from Supabase:', error);
  }
  return getLocalGuru();
}

export async function saveGuruList(guru: Guru[]): Promise<void> {
  try {
    if (supabase) {
      for (const g of guru) {
        const { error } = await supabase.from('guru').upsert({
          id: g.id,
          nip: g.nip,
          nama: g.nama,
          jabatan: g.jabatan,
          kelas_diampu: g.kelas,
          mapel_diampu: g.mapel,
          no_telp: g.noTelp,
          email: g.email,
          status_akun: g.status
        });
        if (error) console.error('Supabase error saving guru:', error);
      }
    }
  } catch (error) {
    console.error('Failed to save guru to Supabase:', error);
  }
  saveLocalGuru(guru);
}

function getLocalGuru(): Guru[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(GURU_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_GURU;
    }
    return DEFAULT_GURU;
  } catch (error) {
    console.error('Failed to get local guru list:', error);
    return DEFAULT_GURU;
  }
}

function saveLocalGuru(guru: Guru[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GURU_STORAGE_KEY, JSON.stringify(guru));
    }
  } catch (error) {
    console.error('Failed to save local guru list:', error);
  }
}

export async function addGuru(guru: Omit<Guru, 'id' | 'createdAt'>): Promise<void> {
  const current = await getGuruList();
  const newGuru: Guru = {
    ...guru,
    id: `guru-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  await saveGuruList([...current, newGuru]);
}

export async function updateGuru(id: string, guruData: Partial<Guru>): Promise<void> {
  const current = await getGuruList();
  const index = current.findIndex(g => g.id === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...guruData };
    await saveGuruList(current);
  }
}

export async function deleteGuru(id: string): Promise<void> {
  const current = await getGuruList();
  await saveGuruList(current.filter(g => g.id !== id));
}

export async function getGuruByJabatan(jabatan: JabatanGuru): Promise<Guru[]> {
  const list = await getGuruList();
  return list.filter(g => g.jabatan === jabatan && g.status === 'Aktif');
}
