'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { X, Loader2, Users, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { AppUser } from './UserManagementClient';

interface Props {
  user: AppUser | null;
  onClose: () => void;
  onSave: (data: AppUser) => void;
}

interface FormData extends AppUser {
  password?: string;
  confirmPassword?: string;
}

const kelasOptions = ['—', '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];

export default function UserFormModal({ user, onClose, onSave }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: user || { role: 'Guru', statusAkun: 'Aktif', kelas: '—' },
  });

  const watchRole = watch('role');
  const watchPassword = watch('password');

  useEffect(() => {
    if (user) reset(user);
    else reset({ role: 'Guru', statusAkun: 'Aktif', kelas: '—' });
  }, [user, reset]);

  const onSubmit = (data: FormData) => {
    // TODO: Backend integration — POST/PUT /api/users
    const { password, confirmPassword, ...userData } = data;
    onSave(userData as AppUser, password);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 className="text-base font-bold">{user ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}</h2>
              <p className="text-xs text-muted-foreground">Isi semua field yang diperlukan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* Informasi Akun */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Informasi Akun</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5">
                  Nama Lengkap <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  {...register('nama', { required: 'Nama lengkap wajib diisi' })}
                  className={`input-field ${errors.nama ? 'input-error' : ''}`}
                  placeholder="Contoh: Ibu Sari Dewi, S.Pd"
                />
                {errors.nama && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.nama.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5">
                  Email <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Gunakan format: nama@mi-islamiyah.sch.id
                </p>
                <input
                  {...register('email', {
                    required: 'Email wajib diisi',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' },
                  })}
                  type="email"
                  className={`input-field font-mono ${errors.email ? 'input-error' : ''}`}
                  placeholder="nama@mi-islamiyah.sch.id"
                />
                {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  Role <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select {...register('role', { required: true })} className="input-field">
                  <option value="Admin">Admin</option>
                  <option value="Guru">Guru</option>
                  <option value="Siswa">Siswa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">Status Akun</label>
                <select {...register('statusAkun')} className="input-field">
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border)' }} />

          {/* Role-specific fields */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              {watchRole === 'Siswa' ? 'Data Siswa' : watchRole === 'Guru' ? 'Data Guru' : 'Data Admin'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {watchRole === 'Guru' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Kelas yang Diajar / Wali Kelas</label>
                    <select {...register('kelas')} className="input-field">
                      {kelasOptions.map(k => <option key={`form-kelas-${k}`} value={k}>{k === '—' ? 'Tidak ada (Guru Mapel)' : `Kelas ${k}`}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Jabatan</label>
                    <input
                      {...register('jabatan')}
                      className="input-field"
                      placeholder="Contoh: Wali Kelas 4A"
                    />
                  </div>
                </>
              )}

              {watchRole === 'Siswa' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Kelas <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <select
                      {...register('kelas', {
                        validate: (v) => watchRole !== 'Siswa' || (v !== '—' && v !== '') || 'Kelas wajib dipilih untuk siswa',
                      })}
                      className={`input-field ${errors.kelas ? 'input-error' : ''}`}
                    >
                      <option value="—">-- Pilih Kelas --</option>
                      {kelasOptions.filter(k => k !== '—').map(k => (
                        <option key={`siswa-kelas-${k}`} value={k}>Kelas {k}</option>
                      ))}
                    </select>
                    {errors.kelas && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.kelas.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Jabatan</label>
                    <input
                      {...register('jabatan')}
                      className="input-field"
                      placeholder="Siswa Kelas 4A"
                    />
                  </div>
                </>
              )}

              {watchRole === 'Admin' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1.5">Jabatan</label>
                  <input
                    {...register('jabatan')}
                    className="input-field"
                    placeholder="Contoh: Kepala Sekolah"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5">No. Telepon</label>
                <input
                  {...register('noTelp')}
                  className="input-field font-mono"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border)' }} />

          {/* Password */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              {user ? 'Ubah Password (opsional)' : 'Password Akun'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  Password {!user && <span style={{ color: 'var(--danger)' }}>*</span>}
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: !user ? 'Password wajib diisi' : false,
                      minLength: { value: 8, message: 'Password minimal 8 karakter' },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  Konfirmasi Password {!user && <span style={{ color: 'var(--danger)' }}>*</span>}
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword', {
                      required: !user ? 'Konfirmasi password wajib diisi' : false,
                      validate: (v) => !watchPassword || v === watchPassword || 'Password tidak cocok',
                    })}
                    type={showConfirm ? 'text' : 'password'}
                    className={`input-field pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Ulangi password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.confirmPassword.message}</p>}
              </div>
            </div>
            {user && (
              <p className="text-xs text-muted-foreground mt-2">
                Kosongkan field password jika tidak ingin mengubah password.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ minWidth: '140px' }}
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
              ) : (
                user ? 'Simpan Perubahan' : 'Buat Akun'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}