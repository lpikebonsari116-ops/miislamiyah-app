const TAHUN_AJARAN_STORAGE_KEY = 'sukma_tahun_ajaran_list';
const CURRENT_TAHUN_AJARAN_KEY = 'sukma_current_tahun_ajaran';
const CURRENT_SEMESTER_KEY = 'sukma_current_semester';

export type Semester = 'Ganjil' | 'Genap';

export interface TahunAjaran {
  id: string;
  nama: string;
  mulai: string;
  selesai: string;
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
}

const DEFAULT_TAHUN_AJARAN: TahunAjaran[] = [
  {
    id: 'ta-2024-2025',
    nama: '2024/2025',
    mulai: '2024-07-01',
    selesai: '2025-06-30',
    status: 'Aktif',
    createdAt: '2024-01-01'
  },
  {
    id: 'ta-2023-2024',
    nama: '2023/2024',
    mulai: '2023-07-01',
    selesai: '2024-06-30',
    status: 'Nonaktif',
    createdAt: '2023-01-01'
  }
];

export function getTahunAjaranList(): TahunAjaran[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TAHUN_AJARAN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_TAHUN_AJARAN;
    }
    return DEFAULT_TAHUN_AJARAN;
  } catch (error) {
    console.error('Failed to get tahun ajaran list:', error);
    return DEFAULT_TAHUN_AJARAN;
  }
}

export function saveTahunAjaranList(list: TahunAjaran[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TAHUN_AJARAN_STORAGE_KEY, JSON.stringify(list));
    }
  } catch (error) {
    console.error('Failed to save tahun ajaran list:', error);
  }
}

export function getCurrentTahunAjaran(): TahunAjaran | null {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CURRENT_TAHUN_AJARAN_KEY);
      if (stored) {
        const list = getTahunAjaranList();
        return list.find(ta => ta.id === stored) || list.find(ta => ta.status === 'Aktif') || list[0];
      }
      const list = getTahunAjaranList();
      return list.find(ta => ta.status === 'Aktif') || list[0];
    }
    return DEFAULT_TAHUN_AJARAN[0];
  } catch (error) {
    console.error('Failed to get current tahun ajaran:', error);
    return DEFAULT_TAHUN_AJARAN[0];
  }
}

export function setCurrentTahunAjaran(id: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_TAHUN_AJARAN_KEY, id);
    }
  } catch (error) {
    console.error('Failed to set current tahun ajaran:', error);
  }
}

export function getCurrentSemester(): Semester {
  try {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(CURRENT_SEMESTER_KEY) as Semester) || 'Ganjil';
    }
    return 'Ganjil';
  } catch (error) {
    console.error('Failed to get current semester:', error);
    return 'Ganjil';
  }
}

export function setCurrentSemester(semester: Semester): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_SEMESTER_KEY, semester);
    }
  } catch (error) {
    console.error('Failed to set current semester:', error);
  }
}

export function addTahunAjaran(tahunAjaran: Omit<TahunAjaran, 'id' | 'createdAt'>): void {
  const current = getTahunAjaranList();
  const newTahunAjaran: TahunAjaran = {
    ...tahunAjaran,
    id: `ta-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  saveTahunAjaranList([...current, newTahunAjaran]);
}

export function updateTahunAjaran(id: string, data: Partial<TahunAjaran>): void {
  const current = getTahunAjaranList();
  const index = current.findIndex(ta => ta.id === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...data };
    saveTahunAjaranList(current);
  }
}

export function deleteTahunAjaran(id: string): void {
  const current = getTahunAjaranList();
  saveTahunAjaranList(current.filter(ta => ta.id !== id));
}
