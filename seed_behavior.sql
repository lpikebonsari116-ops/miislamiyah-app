-- Seed behavior categories
INSERT INTO behavior_categories (group_name, name, points, type) VALUES
-- Keimanan & Ibadah
('Keimanan & Ibadah', 'Terlambat masuk aula sholat Dhuha', -20, 'Keburukan'),
('Keimanan & Ibadah', 'Terlambat ke aula sholat Dhuhur', -20, 'Keburukan'),
('Keimanan & Ibadah', 'Tidak mengikuti dzikir dan doa pagi', -20, 'Keburukan'),
('Keimanan & Ibadah', 'Mengganggu teman saat sholat', -20, 'Keburukan'),
('Keimanan & Ibadah', 'Membuat keributan di aula/masjid', -20, 'Keburukan'),
('Keimanan & Ibadah', 'Tidak mengikuti murojaah dan hafalan', -20, 'Keburukan'),
('Keimanan & Ibadah', 'Membiasakan salam saat masuk/keluar kelas', 5, 'Kebaikan'),
('Keimanan & Ibadah', 'Bersyukur atas nikmat yang diterima', 5, 'Kebaikan'),
('Keimanan & Ibadah', 'Rajin sholat dan beribadah', 5, 'Kebaikan'),
('Keimanan & Ibadah', 'Berdoa sebelum makan dan minum', 5, 'Kebaikan'),

-- Kedisiplinan
('Kedisiplinan', 'Terlambat masuk sekolah tanpa izin', -10, 'Keburukan'),
('Kedisiplinan', 'Berseragam tidak sesuai ketentuan', -10, 'Keburukan'),
('Kedisiplinan', 'Tidak mengikuti upacara bendera', -10, 'Keburukan'),
('Kedisiplinan', 'Tidak membawa perlengkapan belajar lengkap', -10, 'Keburukan'),
('Kedisiplinan', 'Tepat waktu datang ke sekolah', 5, 'Kebaikan'),
('Kedisiplinan', 'Rajin belajar dan mengerjakan tugas', 5, 'Kebaikan'),
('Kedisiplinan', 'Menjaga amanah yang diberikan guru', 5, 'Kebaikan'),
('Kedisiplinan', 'Rajin menyelesaikan PR', 5, 'Kebaikan'),
('Kedisiplinan', 'Mengikuti ekstrakurikuler sesuai jadwal', 5, 'Kebaikan'),

-- Kebersihan & Kerapian
('Kebersihan & Kerapian', 'Membuang sampah sembarangan', -10, 'Keburukan'),
('Kebersihan & Kerapian', 'Melepas sepatu/sandal sembarangan', -10, 'Keburukan'),
('Kebersihan & Kerapian', 'Mencoret meja, kursi, atau dinding sekolah', -10, 'Keburukan'),
('Kebersihan & Kerapian', 'Tidak merapikan buku dan peralatan', -10, 'Keburukan'),
('Kebersihan & Kerapian', 'Membantu menjaga fasilitas sekolah', 5, 'Kebaikan'),
('Kebersihan & Kerapian', 'Membuang sampah pada tempatnya', 5, 'Kebaikan'),
('Kebersihan & Kerapian', 'Menjaga kebersihan diri dan lingkungan', 5, 'Kebaikan'),

-- Tata Krama & Sopan Santun
('Tata Krama & Sopan Santun', 'Berbicara kasar kepada teman/guru', -20, 'Keburukan'),
('Tata Krama & Sopan Santun', 'Mengejek atau memanggil teman dengan julukan buruk', -30, 'Keburukan'),
('Tata Krama & Sopan Santun', 'Tidak mengucapkan salam atau terima kasih', -20, 'Keburukan'),
('Tata Krama & Sopan Santun', 'Memotong pembicaraan orang lain dengan kasar', -20, 'Keburukan'),
('Tata Krama & Sopan Santun', 'Berbicara kotor/jorok', -20, 'Keburukan'),
('Tata Krama & Sopan Santun', 'Menghormati orang tua dan guru', 5, 'Kebaikan'),
('Tata Krama & Sopan Santun', 'Berbicara sopan kepada semua orang', 5, 'Kebaikan'),
('Tata Krama & Sopan Santun', 'Ramah kepada teman baru', 5, 'Kebaikan'),
('Tata Krama & Sopan Santun', 'Sabar menghadapi masalah kecil', 5, 'Kebaikan'),

-- Keamanan & Ketertiban
('Keamanan & Ketertiban', 'Berlari di koridor dengan berbahaya', -30, 'Keburukan'),
('Keamanan & Ketertiban', 'Bermain kasar yang bisa melukai teman', -10, 'Keburukan'),
('Keamanan & Ketertiban', 'Membawa barang terlarang (petasan, senjata mainan)', -30, 'Keburukan'),
('Keamanan & Ketertiban', 'Mendorong, memukul, atau mem-bully teman', -30, 'Keburukan'),
('Keamanan & Ketertiban', 'Tidak mengejek atau mem-bully teman', 5, 'Kebaikan'),
('Keamanan & Ketertiban', 'Antri tertib di kantin atau toilet', 5, 'Kebaikan'),
('Keamanan & Ketertiban', 'Menjaga ketenangan saat guru menjelaskan', 5, 'Kebaikan'),
('Keamanan & Ketertiban', 'Ikut menjaga kebersihan kelas dan sekolah', 5, 'Kebaikan'),

-- Kejujuran & Tanggung Jawab
('Kejujuran & Tanggung Jawab', 'Mencontek saat ujian', -10, 'Keburukan'),
('Kejujuran & Tanggung Jawab', 'Mengambil barang teman tanpa izin', -10, 'Keburukan'),
('Kejujuran & Tanggung Jawab', 'Tidak mengerjakan PR', -10, 'Keburukan'),
('Kejujuran & Tanggung Jawab', 'Tidak mengakui kesalahan yang diperbuat', -10, 'Keburukan'),
('Kejujuran & Tanggung Jawab', 'Adil dan tidak pilih kasih kepada teman', 5, 'Kebaikan'),
('Kejujuran & Tanggung Jawab', 'Memaafkan teman yang berbuat salah', 5, 'Kebaikan'),
('Kejujuran & Tanggung Jawab', 'Suka membantu teman yang membutuhkan', 5, 'Kebaikan'),
('Kejujuran & Tanggung Jawab', 'Jujur dalam perkataan dan perbuatan', 5, 'Kebaikan');
