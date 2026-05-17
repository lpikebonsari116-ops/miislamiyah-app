# 🧪 Quick Testing Guide - SUKMA Authentication

Panduan cepat untuk testing system authentication dan authorization yang baru diimplementasikan.

## 📋 Pre-test Checklist

- [ ] `npm install` sudah dijalankan
- [ ] `npm run dev` berjalan (server di port 4028)
- [ ] Browser terbuka di http://localhost:4028
- [ ] Browser console siap (F12)

---

## 🧪 Test Scenarios

### SCENARIO 1: Admin Login & Full Access

**Target:** Verifikasi admin memiliki akses penuh

1. **Start**
   - [ ] Buka http://localhost:4028
   - [ ] Harus melihat Login Page (atau login form jika di root)

2. **Login sebagai Admin**
   - [ ] Click tombol "Admin" atau input: admin / admin123
   - [ ] Click "Masuk"
   - [ ] Tunggu loading selesai

3. **Verify Dashboard**
   - [ ] Redirect ke dashboard
   - [ ] Sidebar menampilkan ALL menu items
   - [ ] Menu yang seharusnya ada:
     - ✓ Dashboard
     - ✓ Data Siswa
     - ✓ Pengguna ← **Admin only**
     - ✓ Manajemen Kelas
     - ✓ Jadwal Pelajaran
     - ✓ Input Poin
     - ✓ Life Skills Harian
     - ✓ Absensi
     - ✓ Laporan & Rekap

4. **Check Topbar**
   - [ ] Avatar di kanan atas menampilkan initials
   - [ ] Nama user: "Administrator"
   - [ ] Role: "Admin" (badge merah)

5. **Check Sidebar User Info**
   - [ ] Avatar dengan warna merah (#ef4444)
   - [ ] Nama: "Administrator"
   - [ ] Role: "admin"
   - [ ] LogOut icon terlihat

6. **Test User Management (Admin Only)**
   - [ ] Click "Pengguna" di sidebar
   - [ ] Halaman User Management loading ✓
   - [ ] Bisa melihat user data

7. **Logout**
   - [ ] Click avatar di Topbar
   - [ ] Click "Keluar"
   - [ ] Toast: "Logout berhasil"
   - [ ] Redirect ke Login page

**Expected Result:** ✅ PASSED - Admin punya akses full

---

### SCENARIO 2: Guru Login & Partial Access

**Target:** Verifikasi guru tidak bisa akses User Management

1. **Login sebagai Guru**
   - [ ] Buka http://localhost:4028
   - [ ] Click tombol "Guru" atau input: guru / guru123
   - [ ] Click "Masuk"

2. **Verify Sidebar Menu**
   - [ ] "Pengguna" menu TIDAK terlihat ← **Guru restricted**
   - [ ] Menu yang terlihat:
     - ✓ Dashboard
     - ✓ Data Siswa
     - ✗ Pengguna (hidden)
     - ✓ Manajemen Kelas
     - ✓ Jadwal Pelajaran
     - ✓ Input Poin (badge: 3)
     - ✓ Life Skills Harian
     - ✓ Absensi
     - ✓ Laporan & Rekap

3. **Check User Info**
   - [ ] Avatar biru (#3b82f6)
   - [ ] Nama: "Guru Kelas"
   - [ ] Role: "guru"

4. **Test Access to User Management**
   - [ ] Manual URL: http://localhost:4028/user-management
   - [ ] Harus redirect ke dashboard
   - [ ] Toast error: "Hanya Admin yang dapat mengakses"

5. **Can Access Student Management**
   - [ ] Click "Data Siswa"
   - [ ] Halaman loading ✓
   - [ ] Bisa melihat student data

6. **Logout**
   - [ ] Click avatar → "Keluar"
   - [ ] Redirect ke login

**Expected Result:** ✅ PASSED - Guru punya akses terbatas

---

### SCENARIO 3: Murid Login & View Only

**Target:** Verifikasi murid hanya bisa view

1. **Login sebagai Murid**
   - [ ] Click tombol "Murid" atau input: murid / murid123
   - [ ] Click "Masuk"

2. **Verify Sidebar Menu (Most Restricted)**
   - [ ] Hanya 3 menu tersedia:
     - ✓ Dashboard
     - ✓ Jadwal Pelajaran
     - ✓ Life Skills Harian
   - [ ] TIDAK terlihat:
     - ✗ Data Siswa
     - ✗ Pengguna
     - ✗ Manajemen Kelas
     - ✗ Input Poin
     - ✗ Absensi
     - ✗ Laporan & Rekap

3. **Check User Info**
   - [ ] Avatar hijau (#10b981)
   - [ ] Nama: "Siswa"
   - [ ] Role: "murid"

4. **Test Access to Protected Pages**
   - [ ] Try: http://localhost:4028/student-management
   - [ ] Redirect ke dashboard
   - [ ] Try: http://localhost:4028/user-management
   - [ ] Redirect ke dashboard
   - [ ] Try: http://localhost:4028/poin-perilaku
   - [ ] Redirect ke dashboard

5. **Can Access View-Only Pages**
   - [ ] Click "Jadwal Pelajaran"
   - [ ] Halaman loading ✓
   - [ ] Bisa melihat (view only)

6. **Logout**
   - [ ] Click avatar → "Keluar"

**Expected Result:** ✅ PASSED - Murid view-only access

---

### SCENARIO 4: Session Persistence

**Target:** Verifikasi session tersimpan di localStorage

1. **Login sebagai Admin**
   - [ ] Login dengan admin / admin123
   - [ ] Tunggu redirect ke dashboard

2. **Check localStorage**
   - [ ] Press F12 (open DevTools)
   - [ ] Go to: Application → LocalStorage → http://localhost:4028
   - [ ] Cari key: `sukma_auth_user`
   - [ ] Verify value berisi user data:
     ```json
     {
       "id": "1",
       "username": "admin",
       "role": "admin",
       "name": "Administrator",
       "email": "admin@miislamiyah.sch.id"
     }
     ```

3. **Refresh Page (F5)**
   - [ ] Still logged in ✓
   - [ ] Dashboard still loading ✓
   - [ ] No redirect to login ✓

4. **Close Tab & Reopen**
   - [ ] Close browser tab
   - [ ] Reopen http://localhost:4028
   - [ ] Should still be logged in ✓

5. **Clear localStorage & Refresh**
   - [ ] DevTools → Application → Clear Storage
   - [ ] Refresh page (F5)
   - [ ] Should redirect to login ✓

**Expected Result:** ✅ PASSED - Session properly persisted

---

### SCENARIO 5: Error Handling

**Target:** Verifikasi error messages

1. **Wrong Password**
   - [ ] Enter: admin / wrongpassword
   - [ ] Click "Masuk"
   - [ ] Toast error: "Username atau password salah" ✓
   - [ ] Stay on login page ✓

2. **Wrong Username**
   - [ ] Enter: invaliduser / admin123
   - [ ] Click "Masuk"
   - [ ] Toast error: "Username atau password salah" ✓

3. **Empty Fields**
   - [ ] Leave username empty, click "Masuk"
   - [ ] Browser validation (required field) ✓

4. **Access Denied Toast**
   - [ ] Login sebagai guru
   - [ ] Try: /user-management
   - [ ] Toast: "Hanya Admin yang dapat mengakses" ✓

**Expected Result:** ✅ PASSED - Error handling works

---

### SCENARIO 6: Logout Behavior

**Target:** Verifikasi logout clears session

1. **Login & Check Storage**
   - [ ] Login dengan admin
   - [ ] DevTools → Check localStorage has `sukma_auth_user`

2. **Logout**
   - [ ] Click avatar → "Keluar"
   - [ ] Toast: "Logout berhasil" ✓
   - [ ] Redirect to login ✓

3. **Verify Storage Cleared**
   - [ ] DevTools → Application
   - [ ] `sukma_auth_user` should be GONE ✓

4. **Cannot Access Dashboard**
   - [ ] Try: http://localhost:4028/
   - [ ] Shows login form ✓

5. **Fresh Login**
   - [ ] Can login again normally ✓
   - [ ] New session created ✓

**Expected Result:** ✅ PASSED - Logout clears everything

---

## 🎯 Demo Account Quick Reference

```
┌─────────────┬──────────────┬────────────┐
│ Role        │ Username     │ Password   │
├─────────────┼──────────────┼────────────┤
│ Admin       │ admin        │ admin123   │
│ Guru        │ guru         │ guru123    │
│ Murid       │ murid        │ murid123   │
└─────────────┴──────────────┴────────────┘
```

---

## ✅ Final Checklist

Test Summary:
- [ ] Scenario 1: Admin - ✅/❌
- [ ] Scenario 2: Guru - ✅/❌
- [ ] Scenario 3: Murid - ✅/❌
- [ ] Scenario 4: Session - ✅/❌
- [ ] Scenario 5: Errors - ✅/❌
- [ ] Scenario 6: Logout - ✅/❌

**Overall Status:** 
- [ ] ✅ ALL PASSED
- [ ] ⚠️ SOME FAILED (note issues below)
- [ ] ❌ MAJOR ISSUES

**Issues Found (if any):**
```
1. 
2. 
3. 
```

---

## 🐛 Troubleshooting

### Login page tidak muncul
- [ ] Check console (F12) untuk errors
- [ ] Verify npm run dev berjalan
- [ ] Try: http://localhost:4028/ (refresh)

### Sidebar menu tidak sesuai role
- [ ] Logout & clear localStorage
- [ ] Login kembali
- [ ] Check DevTools console

### Cannot access pages
- [ ] Check user role di localStorage
- [ ] Verify URL benar
- [ ] Check browser console untuk errors

### localStorage issues
- [ ] DevTools → Application → Clear Site Data
- [ ] Refresh page
- [ ] Login again

---

**Testing Date:** _______________
**Tester Name:** _______________
**Status:** ✅ Ready for Production

