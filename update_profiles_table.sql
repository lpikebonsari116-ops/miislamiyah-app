-- Menambahkan kolom yang dibutuhkan ke tabel profiles untuk user management
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS kelas TEXT DEFAULT '—',
ADD COLUMN IF NOT EXISTS jabatan TEXT,
ADD COLUMN IF NOT EXISTS status_akun TEXT DEFAULT 'Aktif' CHECK (status_akun IN ('Aktif', 'Nonaktif')),
ADD COLUMN IF NOT EXISTS terakhir_aktif TEXT,
ADD COLUMN IF NOT EXISTS no_telp TEXT DEFAULT '—';

-- Update policy untuk profiles agar bisa diubah
DROP POLICY IF EXISTS "Allow public read for profiles" ON profiles;
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true);
