const MAPEL_STORAGE_KEY = 'sukma_mapel_list';

const DEFAULT_MAPEL = [
  'Al-Quran Hadits',
  'Matematika',
  'Bahasa Indonesia',
  'IPA',
  'IPS',
  'Bahasa Inggris',
  'Penjaskes',
  'Tahfidz',
  'Fiqih',
  'Aqidah Akhlak',
  'SKI',
  'Bahasa Arab',
  'Pendidikan Agama Islam',
  'PPKN',
  'SBdP',
  'Muatan Lokal'
];

export function getMapelList(): string[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(MAPEL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_MAPEL;
    }
    return DEFAULT_MAPEL;
  } catch (error) {
    console.error('Failed to get mapel list:', error);
    return DEFAULT_MAPEL;
  }
}

export function saveMapelList(mapel: string[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MAPEL_STORAGE_KEY, JSON.stringify(mapel));
    }
  } catch (error) {
    console.error('Failed to save mapel list:', error);
  }
}

export function addMapel(mapel: string): void {
  const current = getMapelList();
  if (!current.includes(mapel)) {
    saveMapelList([...current, mapel]);
  }
}

export function deleteMapel(mapel: string): void {
  const current = getMapelList();
  saveMapelList(current.filter(m => m !== mapel));
}
