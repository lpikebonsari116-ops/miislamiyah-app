-- ==========================================
-- SUPABASE DATABASE MIGRATION
-- ==========================================

-- Tabel Profiles (untuk user login)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'murid',
  nama_lengkap TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Siswa
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nis TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  kelas TEXT,
  jenis_kelamin TEXT,
  tanggal_lahir TEXT,
  alamat TEXT,
  no_telp TEXT,
  nama_orang_tua TEXT,
  total_poin INTEGER DEFAULT 50,
  status TEXT DEFAULT 'Aktif',
  wali_kelas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Guru
CREATE TABLE guru (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nip TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  kelas_diampu TEXT,
  mapel_diampu TEXT[],
  no_telp TEXT,
  email TEXT,
  status_akun TEXT DEFAULT 'Aktif',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Kelas
CREATE TABLE kelas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_kelas TEXT NOT NULL,
  tingkat INTEGER NOT NULL,
  wali_kelas TEXT,
  ruangan TEXT,
  tahun_ajaran TEXT,
  status TEXT DEFAULT 'Aktif',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Siswa Kelas (relasi many-to-many)
CREATE TABLE siswa_kelas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kelas_id UUID REFERENCES kelas(id) ON DELETE CASCADE,
  siswa_id UUID REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Mata Pelajaran
CREATE TABLE mata_pelajaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Tahun Ajaran
CREATE TABLE tahun_ajaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  tanggal_mulai TEXT,
  tanggal_selesai TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  semester TEXT DEFAULT 'Ganjil',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Kehadiran
CREATE TABLE kehadiran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id UUID REFERENCES students(id) ON DELETE CASCADE,
  tanggal TEXT NOT NULL,
  status TEXT NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabel Life Skill
CREATE TABLE life_skill (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id UUID REFERENCES students(id) ON DELETE CASCADE,
  tanggal TEXT NOT NULL,
  skill TEXT NOT NULL,
  nilai INTEGER NOT NULL,
  keterangan TEXT,
  kategori TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE siswa_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mata_pelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE tahun_ajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE kehadiran ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_skill ENABLE ROW LEVEL SECURITY;

-- Policy untuk allow all (sementara untuk development)
CREATE POLICY "Allow all access" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all access" ON students FOR ALL USING (true);
CREATE POLICY "Allow all access" ON guru FOR ALL USING (true);
CREATE POLICY "Allow all access" ON kelas FOR ALL USING (true);
CREATE POLICY "Allow all access" ON siswa_kelas FOR ALL USING (true);
CREATE POLICY "Allow all access" ON mata_pelajaran FOR ALL USING (true);
CREATE POLICY "Allow all access" ON tahun_ajaran FOR ALL USING (true);
CREATE POLICY "Allow all access" ON kehadiran FOR ALL USING (true);
CREATE POLICY "Allow all access" ON life_skill FOR ALL USING (true);
