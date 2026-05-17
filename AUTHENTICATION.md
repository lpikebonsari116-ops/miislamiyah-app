# SUKMA Authentication & Authorization System

## ✅ Status Implementasi

Sistem login dan role-based authorization telah diimplementasikan dengan fitur lengkap:

### Features Implemented
- ✅ Login/Logout authentication system
- ✅ Role-based access control (Admin, Guru, Murid)
- ✅ Context API for state management
- ✅ Protected routes dengan role checking
- ✅ Sidebar menu filtering based on user role
- ✅ Topbar user info & logout button
- ✅ Mock authentication database

## 🔐 Akun Demo

### Tersedia 3 akun demo untuk testing:

1. **Admin** (Full Access)
   - Username: `admin`
   - Password: `admin123`
   - Akses: Semua halaman, fitur, dan data management

2. **Guru** (Input & Delete Data)
   - Username: `guru`
   - Password: `guru123`
   - Akses: Dashboard, Data Siswa, Kelas, Jadwal, Input Poin, Life Skills, Absensi

3. **Murid** (View Only)
   - Username: `murid`
   - Password: `murid123`
   - Akses: Dashboard, Jadwal, Life Skills (view only)

## 📁 File Structure

```
src/app/
├── auth.types.ts          # User & Role type definitions
├── auth.lib.ts            # Authentication utilities & mock users
├── AuthContext.tsx        # Auth Context Provider
├── page.tsx               # Protected Dashboard page
├── login-wrapper.tsx      # Login page component
├── login.tsx              # Login route entry

src/components/
├── Topbar.tsx             # User info & logout button
├── Sidebar.tsx            # Role-based menu items
├── ProtectedPage.tsx      # Protected page wrapper component

src/app/student-management/
├── page.tsx               # Protected (Admin/Guru only)

src/app/user-management/
├── page.tsx               # Protected (Admin only)
```

## 🎯 Role Permissions

### Admin
- Akses penuh ke semua halaman
- Dashboard, Data Siswa, User Management, Kelas, Jadwal
- Input Poin, Life Skills, Absensi, Laporan

### Guru
- Dashboard
- Data Siswa (view/edit/delete)
- Kelas Management
- Jadwal Pelajaran (view)
- Input Poin
- Life Skills Harian
- Absensi
- Laporan (view)

### Murid
- Dashboard
- Jadwal Pelajaran (view)
- Life Skills Harian (view)

## 🔄 How It Works

### Login Flow
1. User masuk ke `/login`
2. Enter username & password
3. AuthContext mengvalidasi credentials
4. User data disimpan di localStorage
5. Redirect ke `/` (dashboard)
6. AuthProvider meng-restore session dari localStorage saat refresh

### Route Protection
```tsx
// Protected pages check user role:
- Dashboard: Login required
- Student Management: Guru + Admin only
- User Management: Admin only
- Dynamic menu berdasarkan role
```

### Logout
- Click profil dropdown di Topbar atau Sidebar
- Click "Keluar" button
- Session dihapus dari localStorage
- Redirect ke `/login`

## 🚀 Starting the App

```bash
cd sukma-main
npm install
npm run dev
```

Akses di: `http://localhost:4028`

## 📝 Testing Checklist

- [ ] Login dengan akun Admin
  - [ ] Verify semua menu terlihat di sidebar
  - [ ] Access User Management page (admin-only)
  - [ ] Check role badge di Topbar & Sidebar

- [ ] Logout & Login dengan akun Guru
  - [ ] Verify menu yang berbeda di sidebar
  - [ ] Verify tidak bisa akses User Management
  - [ ] Check role badge

- [ ] Logout & Login dengan akun Murid
  - [ ] Verify hanya 3 menu tersedia
  - [ ] Verify tidak bisa akses management pages
  - [ ] Check role badge

- [ ] Session persistence
  - [ ] Login dengan salah satu akun
  - [ ] Refresh page (F5)
  - [ ] Verify user masih logged in

- [ ] Logout
  - [ ] Click logout button
  - [ ] Verify redirect ke login page
  - [ ] Verify session cleared

## 🔧 Customization

### Menambah User Baru
Edit `src/app/auth.lib.ts`:
```typescript
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  newuser: {
    password: 'password123',
    user: {
      id: '4',
      username: 'newuser',
      role: 'guru',
      name: 'New User Name',
      email: 'newuser@miislamiyah.sch.id',
    },
  },
  // ... existing users
};
```

### Mengubah Menu Items
Edit `src/components/Sidebar.tsx`:
```typescript
const navSections: NavSection[] = [
  {
    section: 'Utama',
    items: [
      { 
        href: '/', 
        label: 'Dashboard', 
        icon: <LayoutDashboard size={18} />, 
        roles: ['admin', 'guru', 'murid'] 
      },
      // ... add new items dengan roles array
    ],
  },
];
```

### Proteksi Halaman Baru
```tsx
'use client';

import { useAuth } from '@/app/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return null;
  }

  return <div>Admin Only Content</div>;
}
```

## 🔮 Future Enhancements

- [ ] Integrate dengan real database/API
- [ ] Password hashing dengan bcrypt
- [ ] Email verification
- [ ] Forgot password functionality
- [ ] Session timeout
- [ ] Two-factor authentication
- [ ] Audit logging

## 📞 Support

Untuk pertanyaan atau issues, silakan hubungi tim development.
