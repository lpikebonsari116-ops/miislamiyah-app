'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateStudentTemplateCSV, parseStudentCSV } from '@/utils/importExport';
import { Student } from './StudentManagementClient';

interface Props {
  onClose: () => void;
  onImportComplete: (students: Omit<Student, 'id' | 'totalPoin' | 'status' | 'waliKelas'>[]) => void;
}

type ImportStep = 'upload' | 'preview' | 'done';

interface PreviewRow {
  row: number;
  nis: string;
  nama: string;
  kelas: string;
  jk: string;
  tanggalLahir: string;
  alamat: string;
  noTelp: string;
  namaOrangTua: string;
  status: 'valid' | 'error';
  errorMessage?: string;
}

export default function BulkImportModal({ onClose, onImportComplete }: Props) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [parsedStudents, setParsedStudents] = useState<Omit<Student, 'id' | 'totalPoin' | 'status' | 'waliKelas'>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    generateStudentTemplateCSV();
    toast.success('Template Excel berhasil diunduh');
  };

  const processFile = async (file: File) => {
    try {
      setLoading(true);
      const students = await parseStudentCSV(file);
      setParsedStudents(students);
      
      const preview: PreviewRow[] = students.map((student, index) => {
        let status: 'valid' | 'error' = 'valid';
        let errorMessage = '';
        
        if (!student.nis) {
          status = 'error';
          errorMessage = 'NIS kosong';
        } else if (!student.nama) {
          status = 'error';
          errorMessage = 'Nama kosong';
        } else if (!student.kelas) {
          status = 'error';
          errorMessage = 'Kelas kosong';
        }
        
        return {
          row: index + 1,
          nis: student.nis,
          nama: student.nama,
          kelas: student.kelas,
          jk: student.jenisKelamin,
          tanggalLahir: student.tanggalLahir,
          alamat: student.alamat,
          noTelp: student.noTelp,
          namaOrangTua: student.namaOrangTua,
          status,
          errorMessage
        };
      });
      
      setPreviewData(preview);
      setStep('preview');
    } catch (error) {
      toast.error('Gagal membaca file. Pastikan format file CSV benar.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    const validStudents = parsedStudents.filter((_, index) => previewData[index].status === 'valid');
    onImportComplete(validStudents);
    
    setLoading(false);
    setStep('done');
    toast.success(`${validStudents.length} siswa berhasil diimpor ke sistem`);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
              <FileSpreadsheet size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 className="text-base font-bold">Import Massal Siswa</h2>
              <p className="text-xs text-muted-foreground">
                {step === 'upload' ? 'Upload file Excel' : step === 'preview' ? 'Pratinjau data' : 'Import selesai'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 px-6 py-3" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
          {['Upload File', 'Pratinjau Data', 'Selesai'].map((label, i) => {
            const stepKey = ['upload', 'preview', 'done'][i] as ImportStep;
            const isActive = step === stepKey;
            const isDone = (step === 'preview' && i === 0) || (step === 'done' && i <= 1);
            return (
              <React.Fragment key={`step-indicator-${i}`}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--border)',
                      color: isDone || isActive ? '#fff' : 'var(--muted-foreground)',
                    }}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-medium" style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div className="flex-1 h-px mx-2" style={{ backgroundColor: 'var(--border)' }} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="px-6 py-5">
          {step === 'upload' && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv"
                style={{ display: 'none' }}
              />
              <div
                className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-4"
                style={{
                  borderColor: dragOver ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: dragOver ? 'var(--primary-light)' : 'var(--muted)',
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { 
                  e.preventDefault(); 
                  setDragOver(false); 
                  const file = e.dataTransfer.files?.[0];
                  if (file) processFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={36} className="mx-auto mb-3" style={{ color: 'var(--primary)' }} />
                <p className="font-semibold text-sm mb-1">Seret file CSV ke sini</p>
                <p className="text-xs text-muted-foreground mb-3">atau klik untuk memilih file</p>
                <p className="text-xs text-muted-foreground">Format: .csv · Maksimal 5MB · Maks. 500 siswa per upload</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--info-bg)', border: '1px solid rgba(37,99,235,0.2)' }}>
                <FileSpreadsheet size={16} style={{ color: 'var(--info)' }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--info)' }}>Gunakan template resmi</p>
                  <p className="text-xs text-muted-foreground">Pastikan format kolom sesuai template agar tidak ada error</p>
                </div>
                <button 
                  className="btn-secondary text-xs py-1.5" 
                  onClick={(e) => { e.stopPropagation(); handleDownloadTemplate(); }}
                >
                  <Download size={13} /> Template
                </button>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={onClose} className="btn-secondary">Batal</button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--success-bg)' }}>
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>
                    {previewData.filter(r => r.status === 'valid').length} data valid
                  </span>
                </div>
                {previewData.filter(r => r.status === 'error').length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--danger-bg)' }}>
                    <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--danger)' }}>
                      {previewData.filter(r => r.status === 'error').length} data error
                    </span>
                  </div>
                )}
              </div>
              <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid var(--border)', maxHeight: '300px', overflowY: 'auto' }}>
                <table className="w-full text-xs">
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr style={{ backgroundColor: 'var(--muted)' }}>
                      <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">No</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">NIS</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Nama</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Kelas</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">JK</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row) => (
                      <tr
                        key={`preview-row-${row.row}`}
                        style={{
                          borderTop: '1px solid var(--border)',
                          backgroundColor: row.status === 'error' ? '#fff5f5' : 'transparent',
                        }}
                      >
                        <td className="px-3 py-2.5 text-muted-foreground">{row.row}</td>
                        <td className="px-3 py-2.5 font-mono">{row.nis || <span style={{ color: 'var(--danger)' }}>—</span>}</td>
                        <td className="px-3 py-2.5 font-medium">{row.nama}</td>
                        <td className="px-3 py-2.5">{row.kelas}</td>
                        <td className="px-3 py-2.5">{row.jk}</td>
                        <td className="px-3 py-2.5">
                          {row.status === 'valid' ? (
                            <span className="badge-active">Valid</span>
                          ) : (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
                              {row.errorMessage}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Data dengan status error tidak akan diimpor. Perbaiki file CSV dan upload ulang untuk menyertakannya.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setStep('upload')} className="btn-secondary">Kembali</button>
                <button onClick={handleImport} disabled={loading} className="btn-primary" style={{ minWidth: '140px' }}>
                  {loading ? (
                    <><Loader2 size={14} className="animate-spin" /> Mengimpor...</>
                  ) : (
                    `Import ${previewData.filter(r => r.status === 'valid').length} Siswa Valid`
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--success-bg)' }}>
                <CheckCircle size={32} style={{ color: 'var(--success)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2">Import Berhasil!</h3>
              <p className="text-sm text-muted-foreground mb-1">
                {previewData.filter(r => r.status === 'valid').length} siswa baru berhasil ditambahkan ke sistem.
              </p>
              {previewData.filter(r => r.status === 'error').length > 0 && (
                <p className="text-xs text-muted-foreground mb-6">
                  {previewData.filter(r => r.status === 'error').length} data dilewati karena error.
                </p>
              )}
              <button onClick={onClose} className="btn-primary">Selesai</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}