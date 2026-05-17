export interface LifeSkillHarian {
  id: string;
  siswaId: string;
  tanggal: string;
  skill: string;
  nilai: number; // 1-5
  keterangan: string;
  kategori: 'Ibadah' | 'Sosial' | 'Akademik' | 'Kemandirian';
}

export interface LifeSkillRingkasan {
  totalHari: number;
  rataRata: number;
  kategoriTerbaik: string;
  trenTerakhir: 'Naik' | 'Turun' | 'Stabil';
}

const LIFESKILL_KEY = 'sukma_life_skill_list';

const DEFAULT_LIFESKILL: LifeSkillHarian[] = [
  { id: 'ls-1', siswaId: 'siswa-001', tanggal: '17/05/2025', skill: 'Sholat Dzuhur Berjamaah', nilai: 5, keterangan: 'Sholat tepat waktu dan khusyuk', kategori: 'Ibadah' },
  { id: 'ls-2', siswaId: 'siswa-001', tanggal: '17/05/2025', skill: 'Membantu Teman', nilai: 4, keterangan: 'Membantu temannya mengambil buku', kategori: 'Sosial' },
  { id: 'ls-3', siswaId: 'siswa-001', tanggal: '16/05/2025', skill: 'Tilawah Al-Quran', nilai: 5, keterangan: 'Membaca dengan lancar', kategori: 'Ibadah' },
  { id: 'ls-4', siswaId: 'siswa-001', tanggal: '16/05/2025', skill: 'Mengerjakan Tugas', nilai: 4, keterangan: 'Tugas selesai tepat waktu', kategori: 'Akademik' },
  { id: 'ls-5', siswaId: 'siswa-001', tanggal: '15/05/2025', skill: 'Merapikan Meja', nilai: 5, keterangan: 'Merapikan meja sendiri sebelum pulang', kategori: 'Kemandirian' },
  { id: 'ls-6', siswaId: 'siswa-001', tanggal: '15/05/2025', skill: 'Bersalaman Guru', nilai: 5, keterangan: 'Sopan dan ramah', kategori: 'Sosial' },
  { id: 'ls-7', siswaId: 'siswa-001', tanggal: '14/05/2025', skill: 'Doa Harian', nilai: 4, keterangan: 'Menghafal doa sebelum belajar', kategori: 'Ibadah' },
  { id: 'ls-8', siswaId: 'siswa-001', tanggal: '14/05/2025', skill: 'Bersih-bersih Kelas', nilai: 5, keterangan: 'Membersihkan sampah di lantai', kategori: 'Kemandirian' },
];

export function getLifeSkillList(): LifeSkillHarian[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LIFESKILL_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_LIFESKILL;
    }
    return DEFAULT_LIFESKILL;
  } catch (error) {
    console.error('Failed to get life skill list:', error);
    return DEFAULT_LIFESKILL;
  }
}

export function saveLifeSkillList(list: LifeSkillHarian[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LIFESKILL_KEY, JSON.stringify(list));
    }
  } catch (error) {
    console.error('Failed to save life skill list:', error);
  }
}

export function getLifeSkillBySiswa(siswaId: string): LifeSkillHarian[] {
  return getLifeSkillList().filter(ls => ls.siswaId === siswaId);
}

export function getLifeSkillRingkasan(siswaId: string): LifeSkillRingkasan {
  const data = getLifeSkillBySiswa(siswaId);
  
  if (data.length === 0) {
    return { totalHari: 0, rataRata: 0, kategoriTerbaik: '-', trenTerakhir: 'Stabil' };
  }

  const totalNilai = data.reduce((sum, item) => sum + item.nilai, 0);
  const rataRata = Math.round((totalNilai / data.length) * 10) / 10;

  const kategoriCount: Record<string, { total: number; count: number }> = {
    'Ibadah': { total: 0, count: 0 },
    'Sosial': { total: 0, count: 0 },
    'Akademik': { total: 0, count: 0 },
    'Kemandirian': { total: 0, count: 0 }
  };

  data.forEach(item => {
    kategoriCount[item.kategori].total += item.nilai;
    kategoriCount[item.kategori].count += 1;
  });

  let kategoriTerbaik = '-';
  let rataTerbaik = 0;
  Object.keys(kategoriCount).forEach(kategori => {
    const info = kategoriCount[kategori];
    if (info.count > 0) {
      const rata = info.total / info.count;
      if (rata > rataTerbaik) {
        rataTerbaik = rata;
        kategoriTerbaik = kategori;
      }
    }
  });

  const last7 = data.slice(0, 7);
  let trenTerakhir: 'Naik' | 'Turun' | 'Stabil' = 'Stabil';
  if (last7.length >= 3) {
    const first3Avg = (last7[last7.length - 1].nilai + last7[last7.length - 2].nilai + last7[last7.length - 3].nilai) / 3;
    const last3Avg = (last7[0].nilai + last7[1].nilai + last7[2].nilai) / 3;
    if (last3Avg > first3Avg + 0.3) trenTerakhir = 'Naik';
    else if (last3Avg < first3Avg - 0.3) trenTerakhir = 'Turun';
  }

  const uniqueDates = new Set(data.map(d => d.tanggal));

  return {
    totalHari: uniqueDates.size,
    rataRata,
    kategoriTerbaik,
    trenTerakhir
  };
}

export function getLifeSkillByTanggal(siswaId: string, tanggal: string): LifeSkillHarian[] {
  return getLifeSkillBySiswa(siswaId).filter(ls => ls.tanggal === tanggal);
}
