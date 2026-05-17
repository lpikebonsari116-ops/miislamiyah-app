'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Plus, Search, Upload, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Edit2, Trash2, Eye, Download, X, FileSpreadsheet, User } from 'lucide-react';
import StudentFormModal from './StudentFormModal';
import StudentDeleteModal from './StudentDeleteModal';
import StudentDetailModal from './StudentDetailModal';
import BulkImportModal from './BulkImportModal';
import { getStudentsList, saveStudentsList } from '@/utils/students';

export interface Student {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  alamat: string;
  waliKelas: string;
  totalPoin: number;
  status: 'Aktif' | 'Tidak Aktif' | 'Pindah';
  noTelp: string;
  namaOrangTua: string;
}

export default function StudentManagementClient() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      const data = await getStudentsList();
      setStudents(data);
    };
    loadStudents();
  }, []);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const handleSaveStudent = async (data: Student) => {
    if (editStudent) {
      const updated = students.map(s => s.id === editStudent.id ? { ...data, id: s.id } : s);
      setStudents(updated);
      await saveStudentsList(updated);
    } else {
      const newId = `siswa-${String(students.length + 1).padStart(3, '0')}`;
      const updated = [{ ...data, id: newId }, ...students];
      setStudents(updated);
      await saveStudentsList(updated);
    }
    setShowAddModal(false);
    setEditStudent(null);
  };

  const handleImportComplete = async (importedStudents: Omit<Student, 'id' | 'totalPoin' | 'status' | 'waliKelas'>[]) => {
    const newStudents = importedStudents.map((student, index) => ({
      ...student,
      id: `siswa-${String(students.length + index + 1).padStart(3, '0')}`,
      totalPoin: 50,
      status: 'Aktif' as const,
      waliKelas: '-'
    }));
    const updated = [...newStudents, ...students];
    setStudents(updated);
    await saveStudentsList(updated);
  };

  const handleDeleteConfirm = async () => {
    if (deleteStudent) {
      const updated = students.filter(s => s.id !== deleteStudent.id);
      setStudents(updated);
      await saveStudentsList(updated);
      setDeleteStudent(null);
    }
  };
  
  // Filtering & Pagination
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.nama.toLowerCase().includes(search.toLowerCase()) || 
      s.nis.includes(search) ||
      s.kelas.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const totalPages = Math.ceil(filteredStudents.length / perPage);
  const paginatedStudents = filteredStudents.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Manajemen Siswa</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Kelola data siswa, wali kelas, dan informasi akademik</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowBulkModal(true)}>
            <Upload size={16} /> Import Massal
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Tambah Siswa
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input 
            type="text" 
            placeholder="Cari NIS atau nama siswa..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }}
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option value={10}>10 Baris</option>
            <option value={25}>25 Baris</option>
            <option value={50}>50 Baris</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['NIS', 'Nama Siswa', 'Kelas', 'Wali Kelas', 'Poin', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>Tidak ada data siswa ditemukan</td>
                </tr>
              ) : (
                paginatedStudents.map((student, i) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{student.nis}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                          {student.nama.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ color: 'var(--foreground)' }}>{student.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge-siswa">Kelas {student.kelas}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{student.waliKelas}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold font-tabular ${student.totalPoin < 60 ? 'text-red-500' : 'text-green-600'}`}>
                        {student.totalPoin}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${student.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded hover:bg-muted" style={{ color: 'var(--success)' }} onClick={() => router.push(`/profil-murid?id=${student.id}`)}>
                          <User size={14} />
                        </button>
                        <button className="p-1.5 rounded hover:bg-muted" style={{ color: 'var(--primary)' }} onClick={() => setViewStudent(student)}>
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 rounded hover:bg-muted" style={{ color: 'var(--info)' }} onClick={() => setEditStudent(student)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="p-1.5 rounded hover:bg-muted" style={{ color: 'var(--danger)' }} onClick={() => setDeleteStudent(student)}>
                          <Trash2 size={14} />
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
        <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Menampilkan <span className="font-semibold">{Math.min(filteredStudents.length, (page - 1) * perPage + 1)}</span> - <span className="font-semibold">{Math.min(filteredStudents.length, page * perPage)}</span> dari <span className="font-semibold">{filteredStudents.length}</span> siswa
          </p>
          <div className="flex gap-2">
            <button 
              className="p-1 rounded border disabled:opacity-50" 
              style={{ borderColor: 'var(--border)' }}
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="p-1 rounded border disabled:opacity-50" 
              style={{ borderColor: 'var(--border)' }}
              disabled={page === totalPages}
              onClick={() => setPage(prev => prev + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(showAddModal || editStudent) && (
        <StudentFormModal 
          isOpen={true}
          onClose={() => { setShowAddModal(false); setEditStudent(null); }}
          onSave={handleSaveStudent}
          student={editStudent}
        />
      )}

      {deleteStudent && (
        <StudentDeleteModal 
          isOpen={true}
          onClose={() => setDeleteStudent(null)}
          onConfirm={handleDeleteConfirm}
          studentName={deleteStudent.nama}
        />
      )}

      {viewStudent && (
        <StudentDetailModal 
          isOpen={true}
          onClose={() => setViewStudent(null)}
          student={viewStudent}
        />
      )}

      {showBulkModal && (
        <BulkImportModal 
          onClose={() => setShowBulkModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  );
}
