'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Users, Plus, Search, Upload, Download, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, ShieldCheck, GraduationCap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import UserFormModal from './UserFormModal';
import UserDeleteModal from './UserDeleteModal';
import { getAllUsers, addCustomUser, updateCustomUser, deleteCustomUser } from '../../auth.lib';

export interface AppUser {
  id: string;
  nama: string;
  email: string;
  role: 'Admin' | 'Guru' | 'Siswa';
  kelas: string;
  jabatan: string;
  statusAkun: 'Aktif' | 'Nonaktif';
  terakhirAktif: string;
  createdAt: string;
  noTelp: string;
  password?: string;
}

const defaultUsers: AppUser[] = [
  { id: '1', nama: 'Administrator Utama', email: 'admin@mi-islamiyah.sch.id', role: 'Admin', kelas: '—', jabatan: 'Admin', statusAkun: 'Aktif', terakhirAktif: new Date().toLocaleDateString('id-ID'), createdAt: new Date().toLocaleDateString('id-ID'), noTelp: '—', password: 'admin123' },
  { id: '2', nama: 'Guru Pengajar', email: 'guru@mi-islamiyah.sch.id', role: 'Guru', kelas: '—', jabatan: 'Guru', statusAkun: 'Aktif', terakhirAktif: new Date().toLocaleDateString('id-ID'), createdAt: new Date().toLocaleDateString('id-ID'), noTelp: '—', password: 'guru123' },
  { id: '3', nama: 'Siswa MI', email: 'murid@mi-islamiyah.sch.id', role: 'Siswa', kelas: '—', jabatan: 'Siswa', statusAkun: 'Aktif', terakhirAktif: new Date().toLocaleDateString('id-ID'), createdAt: new Date().toLocaleDateString('id-ID'), noTelp: '—', password: 'murid123' },
];

type RoleTab = 'Semua' | 'Admin' | 'Guru' | 'Siswa';
type SortField = 'nama' | 'email' | 'role' | 'terakhirAktif';
type SortDir = 'asc' | 'desc';

const roleTabs: RoleTab[] = ['Semua', 'Admin', 'Guru', 'Siswa'];

export default function UserManagementClient() {
  const [users, setUsers] = useState<AppUser[]>(defaultUsers);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<RoleTab>('Semua');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [sortField, setSortField] = useState<SortField>('nama');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AppUser | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const loadUsers = () => {
    const allAuthUsers = getAllUsers();
    const mappedUsers: AppUser[] = allAuthUsers.map(user => ({
      id: user.id,
      nama: user.name,
      email: user.email || `${user.username}@mi-islamiyah.sch.id`,
      role: (user.role === 'admin' ? 'Admin' : user.role === 'guru' ? 'Guru' : 'Siswa') as 'Admin' | 'Guru' | 'Siswa',
      kelas: '—',
      jabatan: user.role === 'admin' ? 'Admin' : user.role === 'guru' ? 'Guru' : 'Siswa',
      statusAkun: 'Aktif',
      terakhirAktif: new Date().toLocaleDateString('id-ID'),
      createdAt: new Date().toLocaleDateString('id-ID'),
      noTelp: '—',
      password: (user as any).password
    }));
    setUsers(mappedUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const roleCounts = useMemo(() => ({
    Semua: users.length,
    Admin: users.filter(u => u.role === 'Admin').length,
    Guru: users.filter(u => u.role === 'Guru').length,
    Siswa: users.filter(u => u.role === 'Siswa').length,
  }), [users]);

  const filtered = useMemo(() => {
    let result = users.filter(u => {
      const matchTab = activeTab === 'Semua' || u.role === activeTab;
      const matchSearch = u.nama.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.kelas.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'Semua Status' || u.statusAkun === filterStatus;
      return matchTab && matchSearch && matchStatus;
    });
    result = result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'nama') cmp = a.nama.localeCompare(b.nama);
      else if (sortField === 'email') cmp = a.email.localeCompare(b.email);
      else if (sortField === 'role') cmp = a.role.localeCompare(b.role);
      else if (sortField === 'terakhirAktif') cmp = a.terakhirAktif.localeCompare(b.terakhirAktif);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [users, activeTab, search, filterStatus, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(paginated.map(u => u.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id); else next.delete(id);
    setSelectedIds(next);
  };

  const handleSaveUser = (data: AppUser, password?: string) => {
    const dbRole = data.role === 'Admin' ? 'admin' : data.role === 'Guru' ? 'guru' : 'murid';
    const username = data.email.split('@')[0];
    
    if (editUser) {
      updateCustomUser(data.id, {
        name: data.nama,
        email: data.email,
        role: dbRole,
        ...(password && { password })
      });
      toast.success(`Akun ${data.nama} berhasil diperbarui`);
    } else {
      addCustomUser({
        id: `user-${Date.now()}`,
        username,
        password: password || 'password123',
        name: data.nama,
        email: data.email,
        role: dbRole
      });
      toast.success(`Akun ${data.nama} berhasil dibuat`);
    }
    
    loadUsers();
    setShowAddModal(false);
    setEditUser(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteUser) {
      deleteCustomUser(deleteUser.id);
      toast.success(`Akun ${deleteUser.nama} berhasil dihapus`);
      loadUsers();
      setDeleteUser(null);
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteCustomUser(id));
    toast.success(`${selectedIds.size} akun berhasil dihapus`);
    setSelectedIds(new Set());
    loadUsers();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={12} className="opacity-40 text-muted-foreground" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} style={{ color: 'var(--primary)' }} />
      : <ChevronDown size={12} style={{ color: 'var(--primary)' }} />;
  };

  function getRoleBadge(role: AppUser['role']) {
    if (role === 'Admin') return <span className="badge-admin flex items-center gap-1"><ShieldCheck size={10} />Admin</span>;
    if (role === 'Guru') return <span className="badge-guru flex items-center gap-1"><BookOpen size={10} />Guru</span>;
    return <span className="badge-siswa flex items-center gap-1"><GraduationCap size={10} />Siswa</span>;
  }

  function getRoleIcon(role: AppUser['role']) {
    if (role === 'Admin') return <ShieldCheck size={14} style={{ color: 'var(--danger)' }} />;
    if (role === 'Guru') return <BookOpen size={14} style={{ color: 'var(--info)' }} />;
    return <GraduationCap size={14} style={{ color: 'var(--success)' }} />;
  }

  function getAvatarColor(role: AppUser['role']) {
    if (role === 'Admin') return 'var(--danger)';
    if (role === 'Guru') return 'var(--info)';
    return 'var(--primary)';
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
            <Users size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
            <p className="text-sm text-muted-foreground">
              {users.length} akun terdaftar · {users.filter(u => u.statusAkun === 'Aktif').length} aktif
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowImportModal(true)} className="btn-secondary text-sm">
            <Upload size={15} />
            Import Excel
          </button>
          <button className="btn-secondary text-sm">
            <Download size={15} />
            Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
            <Plus size={15} />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Stats summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { role: 'Semua', count: roleCounts.Semua, icon: <Users size={16} />, color: 'var(--secondary)', bg: '#f1f5f9' },
          { role: 'Admin', count: roleCounts.Admin, icon: <ShieldCheck size={16} />, color: 'var(--danger)', bg: 'var(--danger-bg)' },
          { role: 'Guru', count: roleCounts.Guru, icon: <BookOpen size={16} />, color: 'var(--info)', bg: 'var(--info-bg)' },
          { role: 'Siswa', count: roleCounts.Siswa, icon: <GraduationCap size={16} />, color: 'var(--success)', bg: 'var(--success-bg)' },
        ].map((item) => (
          <button
            key={`stat-${item.role}`}
            onClick={() => { setActiveTab(item.role as RoleTab); setPage(1); }}
            className="card-elevated rounded-xl p-4 text-left transition-all hover:shadow-card-hover"
            style={{
              border: activeTab === item.role ? `2px solid ${item.color}` : '1px solid var(--border)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{item.role}</span>
            </div>
            <p className="text-2xl font-bold font-tabular" style={{ color: item.color }}>{item.count}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card-elevated rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px]"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
            <Search size={15} className="text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama, email, atau kelas..."
              className="bg-transparent text-sm outline-none w-full"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={14} className="text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="input-field w-auto min-w-[140px]"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>

          {/* Role tab filter inline */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            {roleTabs.map(tab => (
              <button
                key={`role-tab-${tab}`}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                style={{
                  backgroundColor: activeTab === tab ? 'var(--card)' : 'transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--muted-foreground)',
                  boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab}
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-full font-tabular"
                  style={{
                    fontSize: '0.6rem',
                    backgroundColor: activeTab === tab ? 'var(--primary-light)' : 'transparent',
                    color: activeTab === tab ? 'var(--primary)' : 'var(--muted-foreground)',
                  }}
                >
                  {roleCounts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl mb-4 animate-slide-up"
          style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
            {selectedIds.size} pengguna dipilih
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setUsers(prev => prev.map(u => selectedIds.has(u.id) ? { ...u, statusAkun: 'Nonaktif' } : u));
                toast.success(`${selectedIds.size} akun dinonaktifkan`);
                setSelectedIds(new Set());
              }}
              className="btn-secondary text-xs py-1.5"
            >
              Nonaktifkan
            </button>
            <button onClick={handleBulkDelete} className="btn-danger text-xs py-1.5">
              Hapus Terpilih
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card-elevated rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && paginated.every(u => selectedIds.has(u.id))}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded"
                  />
                </th>
                <th
                  className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground cursor-pointer select-none"
                  onClick={() => handleSort('nama')}
                >
                  <div className="flex items-center gap-1">Nama Pengguna <SortIcon field="nama" /></div>
                </th>
                <th
                  className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground cursor-pointer select-none"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">Email <SortIcon field="email" /></div>
                </th>
                <th
                  className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground cursor-pointer select-none"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-1">Role <SortIcon field="role" /></div>
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Kelas / Jabatan</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Status Akun</th>
                <th
                  className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground cursor-pointer select-none"
                  onClick={() => handleSort('terakhirAktif')}
                >
                  <div className="flex items-center gap-1">Terakhir Aktif <SortIcon field="terakhirAktif" /></div>
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={40} className="text-muted-foreground opacity-40" />
                      <p className="font-semibold text-muted-foreground">Tidak ada pengguna ditemukan</p>
                      <p className="text-xs text-muted-foreground">Coba ubah filter atau tambah pengguna baru</p>
                      <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs mt-1">
                        <Plus size={13} /> Tambah Pengguna
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((u, idx) => (
                  <tr
                    key={u.id}
                    className="table-row-hover transition-colors"
                    style={{
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.012)',
                    }}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={e => handleSelectRow(u.id, e.target.checked)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{ fontSize: '0.625rem', backgroundColor: getAvatarColor(u.role) }}
                        >
                          {u.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-tight">{u.nama}</p>
                          <p className="text-xs text-muted-foreground">Dibuat: {u.createdAt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      <span className="font-mono">{u.email}</span>
                    </td>
                    <td className="px-3 py-3">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        {getRoleIcon(u.role)}
                        <span className="text-muted-foreground">{u.jabatan}</span>
                      </div>
                      {u.kelas !== '—' && (
                        <span className="badge-siswa mt-1 inline-block">Kelas {u.kelas}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => {
                          setUsers(prev => prev.map(usr =>
                            usr.id === u.id
                              ? { ...usr, statusAkun: usr.statusAkun === 'Aktif' ? 'Nonaktif' : 'Aktif' }
                              : usr
                          ));
                          toast.success(`Status akun ${u.nama} diubah`);
                        }}
                        className="transition-opacity hover:opacity-75"
                        title={`Klik untuk ${u.statusAkun === 'Aktif' ? 'nonaktifkan' : 'aktifkan'} akun`}
                      >
                        <span className={u.statusAkun === 'Aktif' ? 'badge-active' : 'badge-inactive'}>
                          {u.statusAkun}
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{u.terakhirAktif}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditUser(u)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-muted"
                          title="Edit akun pengguna"
                        >
                          <Edit2 size={14} style={{ color: 'var(--primary)' }} />
                        </button>
                        <button
                          onClick={() => setDeleteUser(u)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-muted"
                          title="Hapus akun pengguna — tidak dapat dibatalkan"
                        >
                          <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Tampilkan</span>
              <select
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="input-field w-auto text-xs py-1"
              >
                {[10, 25, 50].map(n => <option key={`perpage-user-${n}`} value={n}>{n}</option>)}
              </select>
              <span>dari {filtered.length} pengguna</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 hover:bg-muted"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={`user-page-${p}`}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: page === p ? 'var(--primary)' : 'transparent',
                      color: page === p ? '#fff' : 'var(--foreground)',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 hover:bg-muted"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(showAddModal || editUser) && (
        <UserFormModal
          user={editUser}
          onClose={() => { setShowAddModal(false); setEditUser(null); }}
          onSave={handleSaveUser}
        />
      )}
      {deleteUser && (
        <UserDeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {showImportModal && (
        <UserBulkImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}

function UserBulkImportModal({ onClose }: { onClose: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    toast.success('File berhasil diproses. 8 akun baru siap diimpor.');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--info-bg)' }}>
              <Upload size={18} style={{ color: 'var(--info)' }} />
            </div>
            <h2 className="text-base font-bold">Import Massal Pengguna</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        <div className="px-6 py-5">
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4"
            style={{
              borderColor: dragOver ? 'var(--primary)' : 'var(--border)',
              backgroundColor: dragOver ? 'var(--primary-light)' : 'var(--muted)',
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
          >
            <Upload size={28} className="mx-auto mb-2" style={{ color: 'var(--primary)' }} />
            <p className="font-semibold text-sm mb-1">Upload file Excel pengguna</p>
            <p className="text-xs text-muted-foreground">Format: .xlsx · Kolom: Nama, Email, Role, Kelas, Password</p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--warning-bg)', border: '1px solid rgba(217,119,6,0.2)' }}>
            <span className="text-xs" style={{ color: 'var(--warning)' }}>
              ⚠️ Password default akan digenerate otomatis dan dikirim ke email masing-masing pengguna.
            </span>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn-secondary">Batal</button>
            <button className="btn-secondary text-sm">
              <Download size={14} /> Template
            </button>
            <button onClick={handleUpload} disabled={loading} className="btn-primary" style={{ minWidth: '120px' }}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Memproses...</> : <><Upload size={14} /> Upload</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Loader2 } from 'lucide-react';
