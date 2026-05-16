-- Create profiles table for authentication
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- In production, use hashed passwords
  role TEXT NOT NULL CHECK (role IN ('admin', 'guru', 'murid')),
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial mock users
INSERT INTO profiles (username, password, role, name, email) VALUES
('admin', 'admin123', 'admin', 'Administrator', 'admin@miislamiyah.sch.id'),
('guru', 'guru123', 'guru', 'Guru Kelas', 'guru@miislamiyah.sch.id'),
('murid', 'murid123', 'murid', 'Siswa', 'murid@miislamiyah.sch.id');

-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nis TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')),
  tanggal_lahir DATE,
  alamat TEXT,
  wali_kelas TEXT,
  total_poin INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif', 'Pindah')),
  no_telp TEXT,
  nama_orang_tua TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policies (Example: Allow all for now, or restrict by role)
CREATE POLICY "Allow public read for students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow admin and guru to modify students" ON students FOR ALL USING (true);
CREATE POLICY "Allow public read for profiles" ON profiles FOR SELECT USING (true);

-- Create attendance_sessions table
CREATE TABLE attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kelas TEXT NOT NULL,
  tanggal DATE NOT NULL,
  mata_pelajaran TEXT NOT NULL,
  guru TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create attendance_records table
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Sakit', 'Izin', 'Alpha')),
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create behavior_categories table
CREATE TABLE behavior_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_name TEXT NOT NULL,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Kebaikan', 'Keburukan')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create behavior_logs table
CREATE TABLE behavior_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  category_id UUID REFERENCES behavior_categories(id),
  points INTEGER NOT NULL,
  keterangan TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for new tables
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;

-- Policies for new tables
CREATE POLICY "Allow all for attendance_sessions" ON attendance_sessions FOR ALL USING (true);
CREATE POLICY "Allow all for attendance_records" ON attendance_records FOR ALL USING (true);
CREATE POLICY "Allow all for behavior_categories" ON behavior_categories FOR ALL USING (true);
CREATE POLICY "Allow all for behavior_logs" ON behavior_logs FOR ALL USING (true);

-- Create life_skills_records table
CREATE TABLE life_skills_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  value TEXT NOT NULL CHECK (value IN ('B', 'C', 'K')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, tanggal)
);

-- Enable RLS
ALTER TABLE life_skills_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for life_skills_records" ON life_skills_records FOR ALL USING (true);
