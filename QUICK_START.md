# 🔑 QUICK START - SUKMA Authentication

Panduan singkat untuk mulai menggunakan sistem authentication SUKMA.

## 🚀 Start Server

```bash
cd sukma-main
npm run dev
```

**Server berjalan di:** http://localhost:4028

---

## 🔐 Demo Accounts

Login dengan salah satu akun ini:

### Option 1: Click Demo Button
Saat login, klik button: **Admin**, **Guru**, atau **Murid**

### Option 2: Manual Input
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Guru | guru | guru123 |
| Murid | murid | murid123 |

---

## 📌 Key Features

### ✅ What You Can Do

**Admin:**
- Access semua halaman
- Manage users, siswa, kelas
- Input poin perilaku
- View laporan

**Guru:**
- Dashboard
- Manage data siswa (edit/delete)
- Input poin perilaku
- View jadwal & life skills
- Lihat laporan

**Murid:**
- Dashboard (view)
- Lihat jadwal pelajaran
- Lihat life skills harian

---

## 🧪 Quick Test

1. **Open** http://localhost:4028
2. **Login** dengan admin / admin123
3. **Check** sidebar - semua menu terlihat
4. **Click** profile icon (kanan atas)
5. **Click** "Keluar" untuk logout

Expected: Redirect ke login, localStorage cleared ✓

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/app/auth.types.ts` | Type definitions |
| `src/app/auth.lib.ts` | Auth logic & users |
| `src/app/AuthContext.tsx` | Context provider |
| `src/app/page.tsx` | Dashboard (protected) |
| `src/components/Topbar.tsx` | User info & logout |
| `src/components/Sidebar.tsx` | Role-based menu |

---

## 📚 Full Documentation

- **AUTHENTICATION.md** - Complete guide
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **TESTING_GUIDE.md** - 6 test scenarios
- **README_AUTH.md** - This file's parent

---

## 🎨 UI Changes

### Sidebar
- ✅ Menu items filter by role
- ✅ LogOut button at bottom
- ✅ User info with role badge
- ✅ Color-coded: Admin (red), Guru (blue), Murid (green)

### Topbar
- ✅ User profile dropdown
- ✅ LogOut button
- ✅ Role badge
- ✅ Dynamic initials avatar

---

## ⚙️ How It Works

1. **App Start** → AuthProvider loads user from localStorage
2. **No User** → Show login page
3. **Login** → Validate credentials → Save to localStorage
4. **Protected Pages** → Check user.role → Allow/Deny
5. **Logout** → Clear localStorage → Show login

---

## 🛡️ Access Control

```
Admin (role: 'admin')
├─ Dashboard ✓
├─ Data Siswa ✓
├─ Pengguna ✓ [Admin Only]
├─ Kelas ✓
├─ Jadwal ✓
├─ Poin Perilaku ✓
├─ Life Skills ✓
├─ Absensi ✓
└─ Laporan ✓

Guru (role: 'guru')
├─ Dashboard ✓
├─ Data Siswa ✓
├─ Pengguna ✗ [Restricted]
├─ Kelas ✓
├─ Jadwal ✓
├─ Poin Perilaku ✓
├─ Life Skills ✓
├─ Absensi ✓
└─ Laporan ✓

Murid (role: 'murid')
├─ Dashboard ✓
├─ Data Siswa ✗ [Restricted]
├─ Pengguna ✗ [Restricted]
├─ Kelas ✗ [Restricted]
├─ Jadwal ✓
├─ Poin Perilaku ✗ [Restricted]
├─ Life Skills ✓
├─ Absensi ✗ [Restricted]
└─ Laporan ✗ [Restricted]
```

---

## 🔍 Troubleshooting

### Login page tidak muncul
→ Refresh browser F5

### Menu tidak sesuai role
→ Logout & login kembali

### Cannot access page
→ Check user role (F12 → Application → localStorage)

### Session tidak persist
→ Check browser allows localStorage

---

## 💾 Session Storage

User data disimpan di:
```
localStorage['sukma_auth_user'] = {
  "id": "1",
  "username": "admin",
  "role": "admin",
  "name": "Administrator",
  "email": "admin@miislamiyah.sch.id"
}
```

**Clear session:**
- F12 → Application → Clear site data, atau
- Logout button

---

## ✨ What's Next?

1. **Test everything** - Follow TESTING_GUIDE.md
2. **Add real database** - Replace mock users
3. **Enhanced security** - JWT, hashing, etc
4. **Production deploy** - Build & deploy

---

## 📞 Need Help?

1. Check AUTHENTICATION.md (lengkap)
2. Check TESTING_GUIDE.md (testing issues)
3. Check browser console (F12) untuk errors

---

**Status:** ✅ Ready to Use
**Version:** 1.0
**Last Updated:** May 15, 2026

🎉 Sistem authentication SUKMA sudah siap digunakan!
