'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Search, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const ASMAUL_HUSNA = [
  { id: 1, arab: 'الرَّحْمَنُ', latin: 'Ar-Rahman', arti: 'Yang Maha Pengasih' },
  { id: 2, arab: 'الرَّحِيمُ', latin: 'Ar-Rahim', arti: 'Yang Maha Penyayang' },
  { id: 3, arab: 'الْمَلِكُ', latin: 'Al-Malik', arti: 'Yang Maha Merajai' },
  { id: 4, arab: 'الْقُدُّوسُ', latin: 'Al-Quddus', arti: 'Yang Maha Suci' },
  { id: 5, arab: 'السَّلَامُ', latin: 'As-Salam', arti: 'Yang Maha Memberi Kesejahteraan' },
  { id: 6, arab: 'الْمُؤْمِنُ', latin: 'Al-Mu\'min', arti: 'Yang Maha Memberi Keamanan' },
  { id: 7, arab: 'الْمُهَيْمِنُ', latin: 'Al-Muhaymin', arti: 'Yang Maha Memelihara' },
  { id: 8, arab: 'الْعَزِيزُ', latin: 'Al-Aziz', arti: 'Yang Maha Perkasa' },
  { id: 9, arab: 'الْجَبَّارُ', latin: 'Al-Jabbar', arti: 'Yang Memiliki Mutlak Kegagahan' },
  { id: 10, arab: 'الْمُتَكَبِّرُ', latin: 'Al-Mutakabbir', arti: 'Yang Maha Megah' },
  { id: 11, arab: 'الْخَالِقُ', latin: 'Al-Khaliq', arti: 'Yang Maha Pencipta' },
  { id: 12, arab: 'الْبَارِئُ', latin: 'Al-Bari\'', arti: 'Yang Maha Mengadakan' },
  { id: 13, arab: 'الْمُصَوِّرُ', latin: 'Al-Mushawwir', arti: 'Yang Maha Membentuk Rupa' },
  { id: 14, arab: 'الْغَفَّارُ', latin: 'Al-Ghaffar', arti: 'Yang Maha Pengampun' },
  { id: 15, arab: 'الْقَهَّارُ', latin: 'Al-Qahhar', arti: 'Yang Maha Menundukkan' },
  { id: 16, arab: 'الْوَهَّابُ', latin: 'Al-Wahhab', arti: 'Yang Maha Pemberi Karunia' },
  { id: 17, arab: 'الرَّزَّاقُ', latin: 'Ar-Razzaq', arti: 'Yang Maha Pemberi Rezeki' },
  { id: 18, arab: 'الْفَتَّاحُ', latin: 'Al-Fattah', arti: 'Yang Maha Pembuka Rahmat' },
  { id: 19, arab: 'الْعَلِيمُ', latin: 'Al-\'Alim', arti: 'Yang Maha Mengetahui' },
  { id: 20, arab: 'الْقَابِضُ', latin: 'Al-Qabidh', arti: 'Yang Maha Menyempitkan' },
  { id: 21, arab: 'الْبَاسِطُ', latin: 'Al-Basith', arti: 'Yang Maha Melapangkan' },
  { id: 22, arab: 'الْخَافِضُ', latin: 'Al-Khafidh', arti: 'Yang Maha Merendahkan' },
  { id: 23, arab: 'الرَّافِعُ', latin: 'Ar-Rafi\'', arti: 'Yang Maha Meninggikan' },
  { id: 24, arab: 'الْمُعِزُّ', latin: 'Al-Mu\'izz', arti: 'Yang Maha Memuliakan' },
  { id: 25, arab: 'الْمُذِلُّ', latin: 'Al-Mudzhill', arti: 'Yang Maha Menghinakan' },
  { id: 26, arab: 'السَّمِيعُ', latin: 'As-Sami\'', arti: 'Yang Maha Mendengar' },
  { id: 27, arab: 'الْبَصِيرُ', latin: 'Al-Bashir', arti: 'Yang Maha Melihat' },
  { id: 28, arab: 'الْحَكَمُ', latin: 'Al-Hakam', arti: 'Yang Maha Menetapkan' },
  { id: 29, arab: 'الْعَدْلُ', latin: 'Al-\'Adl', arti: 'Yang Maha Adil' },
  { id: 30, arab: 'اللَّطِيفُ', latin: 'Al-Lathif', arti: 'Yang Maha Lembut' },
  { id: 31, arab: 'الْخَبِيرُ', latin: 'Al-Khabir', arti: 'Yang Maha Mengenal' },
  { id: 32, arab: 'الْحَلِيمُ', latin: 'Al-Halim', arti: 'Yang Maha Penyantun' },
  { id: 33, arab: 'الْعَظِيمُ', latin: 'Al-\'Azhim', arti: 'Yang Maha Agung' },
  { id: 34, arab: 'الْغَفُورُ', latin: 'Al-Ghafur', arti: 'Yang Maha Memberi Pengampunan' },
  { id: 35, arab: 'الشَّكُورُ', latin: 'Asy-Syakur', arti: 'Yang Maha Membalas Budi' },
  { id: 36, arab: 'الْعَلِيُّ', latin: 'Al-\'Aliy', arti: 'Yang Maha Tinggi' },
  { id: 37, arab: 'الْكَبِيرُ', latin: 'Al-Kabir', arti: 'Yang Maha Besar' },
  { id: 38, arab: 'الْحَفِيظُ', latin: 'Al-Hafizh', arti: 'Yang Maha Memelihara' },
  { id: 39, arab: 'الْمُقِيتُ', latin: 'Al-Muqit', arti: 'Yang Maha Pemberi Kecukupan' },
  { id: 40, arab: 'الْحَسِيبُ', latin: 'Al-Hasib', arti: 'Yang Maha Membuat Perhitungan' },
  { id: 41, arab: 'الْجَلِيلُ', latin: 'Al-Jalil', arti: 'Yang Maha Luhur' },
  { id: 42, arab: 'الْكَرِيمُ', latin: 'Al-Karim', arti: 'Yang Maha Pemurah' },
  { id: 43, arab: 'الرَّقِيبُ', latin: 'Ar-Raqib', arti: 'Yang Maha Mengawasi' },
  { id: 44, arab: 'الْمُجِيبُ', latin: 'Al-Mujib', arti: 'Yang Maha Mengabulkan' },
  { id: 45, arab: 'الْوَاسِعُ', latin: 'Al-Wasi\'', arti: 'Yang Maha Luas' },
  { id: 46, arab: 'الْحَكِيمُ', latin: 'Al-Hakim', arti: 'Yang Maha Bijaksana' },
  { id: 47, arab: 'الْوَدُودُ', latin: 'Al-Wadud', arti: 'Yang Maha Mengasihi' },
  { id: 48, arab: 'الْمَجِيدُ', latin: 'Al-Majid', arti: 'Yang Maha Mulia' },
  { id: 49, arab: 'الْبَاعِثُ', latin: 'Al-Ba\'its', arti: 'Yang Maha Membangkitkan' },
  { id: 50, arab: 'الشَّهِيدُ', latin: 'Asy-Syahid', arti: 'Yang Maha Menyaksikan' },
  { id: 51, arab: 'الْحَقُّ', latin: 'Al-Haqq', arti: 'Yang Maha Benar' },
  { id: 52, arab: 'الْوَكِيلُ', latin: 'Al-Wakil', arti: 'Yang Maha Memelihara' },
  { id: 53, arab: 'الْقَوِيُّ', latin: 'Al-Qawiy', arti: 'Yang Maha Kuat' },
  { id: 54, arab: 'الْمَتِينُ', latin: 'Al-Matin', arti: 'Yang Maha Kokoh' },
  { id: 55, arab: 'الْوَلِيُّ', latin: 'Al-Wali', arti: 'Yang Maha Melindungi' },
  { id: 56, arab: 'الْحَمِيدُ', latin: 'Al-Hamid', arti: 'Yang Maha Terpuji' },
  { id: 57, arab: 'الْمُحْصِي', latin: 'Al-Muhshi', arti: 'Yang Maha Mengkalkulasi' },
  { id: 58, arab: 'الْمُبْدِئُ', latin: 'Al-Mubdi\'', arti: 'Yang Maha Memulai' },
  { id: 59, arab: 'الْمُعِيدُ', latin: 'Al-Mu\'id', arti: 'Yang Maha Mengembalikan Kehidupan' },
  { id: 60, arab: 'الْمُحْيِي', latin: 'Al-Muhyi', arti: 'Yang Maha Menghidupkan' },
  { id: 61, arab: 'الْمُمِيتُ', latin: 'Al-Mumit', arti: 'Yang Maha Mematikan' },
  { id: 62, arab: 'الْحَيُّ', latin: 'Al-Hayyu', arti: 'Yang Maha Hidup' },
  { id: 63, arab: 'الْقَيُّومُ', latin: 'Al-Qayyum', arti: 'Yang Maha Mandiri' },
  { id: 64, arab: 'الْوَاجِدُ', latin: 'Al-Wajid', arti: 'Yang Maha Penemu' },
  { id: 65, arab: 'الْمَاجِدُ', latin: 'Al-Majid', arti: 'Yang Maha Mulia' },
  { id: 66, arab: 'الْوَاحِدُ', latin: 'Al-Wahid', arti: 'Yang Maha Tunggal' },
  { id: 67, arab: 'الْأَحَدُ', latin: 'Al-Ahad', arti: 'Yang Maha Esa' },
  { id: 68, arab: 'الصَّمَدُ', latin: 'Ash-Shamad', arti: 'Yang Maha Dibutuhkan' },
  { id: 69, arab: 'الْقَادِرُ', latin: 'Al-Qadir', arti: 'Yang Maha Menentukan' },
  { id: 70, arab: 'الْمُقْتَدِرُ', latin: 'Al-Muqtadir', arti: 'Yang Maha Berkuasa' },
  { id: 71, arab: 'الْمُقَدِّمُ', latin: 'Al-Muqaddim', arti: 'Yang Maha Mendahulukan' },
  { id: 72, arab: 'الْمُؤَخِّرُ', latin: 'Al-Mu\'akhkhir', arti: 'Yang Maha Mengakhirkan' },
  { id: 73, arab: 'الْأَوَّلُ', latin: 'Al-Awwal', arti: 'Yang Maha Awal' },
  { id: 74, arab: 'الْآخِرُ', latin: 'Al-Akhir', arti: 'Yang Maha Akhir' },
  { id: 75, arab: 'الظَّاهِرُ', latin: 'Az-Zhahir', arti: 'Yang Maha Nyata' },
  { id: 76, arab: 'الْبَاطِنُ', latin: 'Al-Bathin', arti: 'Yang Maha Gaib' },
  { id: 77, arab: 'الْوَالِي', latin: 'Al-Wali', arti: 'Yang Maha Memerintah' },
  { id: 78, arab: 'الْمُتَعَالِي', latin: 'Al-Muta\'ali', arti: 'Yang Maha Tinggi' },
  { id: 79, arab: 'الْبَرُّ', latin: 'Al-Barru', arti: 'Yang Maha Penderma' },
  { id: 80, arab: 'التَّوَّابُ', latin: 'At-Tawwab', arti: 'Yang Maha Penerima Tobat' },
  { id: 81, arab: 'الْمُنْتَقِمُ', latin: 'Al-Muntaqim', arti: 'Yang Maha Pemberi Balasan' },
  { id: 82, arab: 'الْعَفُوُّ', latin: 'Al-\'Afuww', arti: 'Yang Maha Pemaaf' },
  { id: 83, arab: 'الرَّءُوفُ', latin: 'Ar-Ra\'uf', arti: 'Yang Maha Pengasuh' },
  { id: 84, arab: 'مَالِكُ الْمُلْكِ', latin: 'Malikul Mulk', arti: 'Yang Maha Penguasa Kerajaan' },
  { id: 85, arab: 'ذُو الْجَلَالِ وَالْإِكْرَامِ', latin: 'Dzul Jalali wal Ikram', arti: 'Yang Maha Memiliki Kebesaran dan Kemuliaan' },
  { id: 86, arab: 'الْمُقْسِطُ', latin: 'Al-Muqsit', arti: 'Yang Maha Pemberi Keadilan' },
  { id: 87, arab: 'الْجَامِعُ', latin: 'Al-Jami\'', arti: 'Yang Maha Mengumpulkan' },
  { id: 88, arab: 'الْغَنِيُّ', latin: 'Al-Ghaniy', arti: 'Yang Maha Kaya' },
  { id: 89, arab: 'الْمُغْنِي', latin: 'Al-Mughni', arti: 'Yang Maha Memberi Kekayaan' },
  { id: 90, arab: 'الْمَانِعُ', latin: 'Al-Mani\'', arti: 'Yang Maha Mencegah' },
  { id: 91, arab: 'الضَّارُّ', latin: 'Adh-Dharr', arti: 'Yang Maha Penimpa Kemudaratan' },
  { id: 92, arab: 'النَّافِعُ', latin: 'An-Nafi\'', arti: 'Yang Maha Memberi Manfaat' },
  { id: 93, arab: 'النُّورُ', latin: 'An-Nur', arti: 'Yang Maha Bercahaya' },
  { id: 94, arab: 'الْهَادِي', latin: 'Al-Hadi', arti: 'Yang Maha Pemberi Petunjuk' },
  { id: 95, arab: 'الْبَدِيعُ', latin: 'Al-Badi\'', arti: 'Yang Maha Pencipta Tiada Bandingannya' },
  { id: 96, arab: 'الْبَاقِي', latin: 'Al-Baqi', arti: 'Yang Maha Kekal' },
  { id: 97, arab: 'الْوَارِثُ', latin: 'Al-Warits', arti: 'Yang Maha Pewaris' },
  { id: 98, arab: 'الرَّشِيدُ', latin: 'Ar-Rasyid', arti: 'Yang Maha Pandai' },
  { id: 99, arab: 'الصَّبُورُ', latin: 'Ash-Shabur', arti: 'Yang Maha Sabar' }
];

const ITEMS_PER_PAGE = 20;

export default function AsmaulHusnaPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return ASMAUL_HUSNA.filter(item => 
      item.latin.toLowerCase().includes(search.toLowerCase()) || 
      item.arti.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Asmaul Husna</h1>
            <p className="text-sm text-muted-foreground">99 Nama Allah yang Indah dan Baik</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau arti..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Dense Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
          {currentData.map((item) => (
            <div 
              key={item.id} 
              className="card-elevated p-4 flex flex-col items-center text-center space-y-3 hover:border-primary transition-all group relative overflow-hidden"
            >
              <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center text-primary/40 text-[10px] font-bold">
                {item.id}
              </div>
              <h2 className="text-2xl font-serif py-2 group-hover:scale-110 transition-transform text-foreground" dir="rtl">{item.arab}</h2>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-primary truncate w-full px-1">{item.latin}</p>
                <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2 px-1">{item.arti}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Search size={24} />
            </div>
            <p className="text-muted-foreground">Nama yang Anda cari tidak ditemukan.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Menampilkan {Math.min(filteredData.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredData.length, currentPage * ITEMS_PER_PAGE)} dari {filteredData.length} nama
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-primary/5 p-4 rounded-2xl flex items-center gap-4 border border-primary/10">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={20} />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-primary">Fadhilah Membaca Asmaul Husna</p>
            <p className="text-xs text-muted-foreground">
              "Allah memiliki Asmaul Husna, maka bermohonlah kepada-Nya dengan menyebut Asmaul Husna itu." (QS. Al-A'raf: 180)
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
