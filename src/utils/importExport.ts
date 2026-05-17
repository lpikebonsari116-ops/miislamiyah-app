import { Student } from '@/app/student-management/components/StudentManagementClient';

export function generateStudentTemplateCSV(): void {
  const headers = ['NIS', 'Nama Lengkap', 'Kelas', 'Jenis Kelamin (L/P)', 'Tanggal Lahir (DD/MM/YYYY)', 'Alamat', 'No. Telepon Orang Tua', 'Nama Orang Tua'];
  const exampleData = [
    ['2025001', 'Muhammad Rizky Pratama', '1A', 'L', '15/03/2019', 'Jl. Contoh No. 123, Malang', '081234567890', 'Bapak Pratama'],
    ['2025002', 'Siti Aisyah Putri', '1A', 'P', '22/07/2019', 'Jl. Contoh No. 456, Malang', '082345678901', 'Ibu Putri']
  ];
  
  const csvContent = [headers, ...exampleData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'template_siswa_mi_islamiyah.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseStudentCSV(file: File): Promise<Omit<Student, 'id' | 'totalPoin' | 'status' | 'waliKelas'>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
          reject(new Error('File CSV tidak memiliki data'));
          return;
        }
        
        const results: Omit<Student, 'id' | 'totalPoin' | 'status' | 'waliKelas'>[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          
          if (values.length >= 8) {
            results.push({
              nis: values[0],
              nama: values[1],
              kelas: values[2],
              jenisKelamin: (values[3] === 'L' || values[3] === 'P') ? values[3] as 'L' | 'P' : 'L',
              tanggalLahir: values[4],
              alamat: values[5],
              noTelp: values[6],
              namaOrangTua: values[7]
            });
          }
        }
        
        resolve(results);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file);
  });
}
