'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/app/AuthContext';
import { supabase } from '@/utils/supabase';
import { Save, Edit2, X } from 'lucide-react';

interface Student {
  id: string;
  nama: string;
  kelas: string;
  nis: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  semester: string;
  score: number;
  students?: { nama: string; nis: string };
  subjects?: { name: string };
}

export default function PenilaianPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil 2025/2026');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('id, nama, kelas, nis').order('nama');
    if (data) setStudents(data);
  };

  const fetchSubjects = async () => {
    const { data } = await supabase.from('subjects').select('id, name').order('name');
    if (data) setSubjects(data);
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('grades')
        .select(`id, student_id, subject_id, semester, score, students (nama, nis), subjects (name)`)
        .eq('semester', selectedSemester);

      if (selectedClass) query = query.eq('students.kelas', selectedClass);
      if (selectedSubject) query = query.eq('subject_id', selectedSubject);

      const { data, error } = await query;
      if (!error && data) setGrades(data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [selectedSemester, selectedClass, selectedSubject]);

  const handleEdit = (grade: Grade) => {
    setEditingId(grade.id);
    setEditScore(grade.score);
  };

  const handleSave = async (gradeId: string) => {
    const { error } = await supabase.from('grades').update({ score: editScore }).eq('id', gradeId);
    if (!error) {
      setEditingId(null);
      fetchGrades();
      setHasChanges(false);
    }
  };

  const classes = [...new Set(students.map(s => s.kelas))];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Penilaian Akademik</h1>
          <p className="text-sm text-gray-500 mt-1">Input dan kelola nilai siswa</p>
        </div>

        {/* Filter */}
        <div className="card-elevated p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Semester</label>
              <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="Ganjil 2025/2026">Ganjil 2025/2026</option>
                <option value="Genap 2025/2026">Genap 2025/2026</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Kelas</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="">Semua Kelas</option>
                {classes.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Mata Pelajaran</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="">Semua Mapel</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Nilai */}
        <div className="card-elevated overflow-hidden">
          <div className="px-5 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Daftar Nilai</h3>
            <span className="text-sm text-gray-500">{grades.length} data</span>
          </div>

          {loading ? (
            <div className="p-8 text-center">Memuat data...</div>
          ) : grades.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada data nilai.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-sm">NIS</th>
                  <th className="text-left px-5 py-3 text-sm">Nama Siswa</th>
                  <th className="text-left px-5 py-3 text-sm">Mata Pelajaran</th>
                  <th className="text-center px-5 py-3 text-sm">Nilai</th>
                  <th className="text-center px-5 py-3 text-sm w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {grades.map((grade) => (
                  <tr key={grade.id}>
                    <td className="px-5 py-3 font-mono text-sm">{grade.students?.nis}</td>
                    <td className="px-5 py-3 font-medium">{grade.students?.nama}</td>
                    <td className="px-5 py-3 text-sm">{grade.subjects?.name}</td>
                    <td className="px-5 py-3 text-center">
                      {editingId === grade.id ? (
                        <input type="number" value={editScore} onChange={(e) => setEditScore(parseInt(e.target.value))} className="w-20 border rounded px-2 py-1 text-center" min="0" max="100" />
                      ) : (
                        <span className="font-semibold text-lg">{grade.score}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {editingId === grade.id ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleSave(grade.id)} className="text-green-600"><Save size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500"><X size={16} /></button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(grade)} className="text-blue-600"><Edit2 size={16} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}