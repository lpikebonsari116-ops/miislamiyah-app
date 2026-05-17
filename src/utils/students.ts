import { Student } from '@/app/student-management/components/StudentManagementClient';
import { supabase } from './supabase';

const STUDENTS_STORAGE_KEY = 'sukma_students_list';

const DEFAULT_STUDENTS: Student[] = [
  { id: 'siswa-001', nama: 'Muhammad Rizky Pratama', nis: '2024001', kelas: '1A', jenisKelamin: 'L', tanggalLahir: '15/03/2019', alamat: 'Jl. Kebonsari No. 123, Malang', noTelp: '081234567890', namaOrangTua: 'Bapak Pratama', totalPoin: 50, status: 'Aktif', waliKelas: 'Ibu Laila Mufidah, S.Pd' },
  { id: 'siswa-002', nama: 'Siti Aisyah Putri', nis: '2024002', kelas: '1A', jenisKelamin: 'P', tanggalLahir: '22/07/2019', alamat: 'Jl. Dinoyo No. 456, Malang', noTelp: '082345678901', namaOrangTua: 'Ibu Putri', totalPoin: 50, status: 'Aktif', waliKelas: 'Ibu Laila Mufidah, S.Pd' },
  { id: 'siswa-003', nama: 'Ahmad Fauzan', nis: '2024003', kelas: '2A', jenisKelamin: 'L', tanggalLahir: '10/01/2018', alamat: 'Jl. Soekarno Hatta No. 78, Malang', noTelp: '083456789012', namaOrangTua: 'Bapak Fauzan', totalPoin: 50, status: 'Aktif', waliKelas: 'Pak Denny Firmansyah, S.Pd' },
];

export async function getStudentsList(): Promise<Student[]> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('nama');
      
      if (error) {
        console.error('Supabase error fetching students:', error);
        return getLocalStudents();
      }
      
      if (data && data.length > 0) {
        return data.map(s => ({
          id: s.id,
          nama: s.nama,
          nis: s.nis,
          kelas: s.kelas,
          jenisKelamin: s.jenis_kelamin,
          tanggalLahir: s.tanggal_lahir,
          alamat: s.alamat,
          noTelp: s.no_telp,
          namaOrangTua: s.nama_orang_tua,
          totalPoin: s.total_poin,
          status: s.status,
          waliKelas: s.wali_kelas
        }));
      }
    }
  } catch (error) {
    console.error('Failed to get students from Supabase:', error);
  }
  return getLocalStudents();
}

export async function saveStudentsList(students: Student[]): Promise<void> {
  try {
    if (supabase) {
      for (const student of students) {
        const { error } = await supabase
          .from('students')
          .upsert({
            id: student.id,
            nis: student.nis,
            nama: student.nama,
            kelas: student.kelas,
            jenis_kelamin: student.jenisKelamin,
            tanggal_lahir: student.tanggalLahir,
            alamat: student.alamat,
            no_telp: student.noTelp,
            nama_orang_tua: student.namaOrangTua,
            total_poin: student.totalPoin,
            status: student.status,
            wali_kelas: student.waliKelas
          });
        
        if (error) {
          console.error('Supabase error saving student:', error);
        }
      }
    }
  } catch (error) {
    console.error('Failed to save students to Supabase:', error);
  }
  saveLocalStudents(students);
}

function getLocalStudents(): Student[] {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STUDENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_STUDENTS;
    }
    return DEFAULT_STUDENTS;
  } catch (error) {
    console.error('Failed to get local students list:', error);
    return DEFAULT_STUDENTS;
  }
}

function saveLocalStudents(students: Student[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    }
  } catch (error) {
    console.error('Failed to save local students list:', error);
  }
}
