import React, { useState } from 'react';
import { Database, Download, Upload, Trash2, AlertTriangle, CheckCircle2, PlayCircle } from 'lucide-react';
import localforage from 'localforage';
import { Button } from '../../components/ui/Button';
import { useTourStore } from '../../store/tourStore';

export function SettingsPage() {
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const startTour = useTourStore(state => state.startTour);

  const handleExport = async () => {
    try {
      setExportStatus('Mengekspor data...');
      const keys = await localforage.keys();
      const exportData: Record<string, any> = {};
      
      for (const key of keys) {
        exportData[key] = await localforage.getItem(key);
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `madrasah-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportStatus('Ekspor berhasil!');
      setTimeout(() => setExportStatus(null), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('Gagal mengekspor data.');
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setImportStatus('Mengimpor data...');
        const json = event.target?.result as string;
        const data = JSON.parse(json);
        
        for (const [key, value] of Object.entries(data)) {
          await localforage.setItem(key, value);
        }
        
        setImportStatus('Impor berhasil! Silakan muat ulang halaman.');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('Import failed:', error);
        setImportStatus('Gagal mengimpor. Format tidak valid.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!')) {
      try {
        await localforage.clear();
        alert('Semua data berhasil dihapus.');
        window.location.reload();
      } catch (error) {
        console.error('Clear failed:', error);
        alert('Gagal menghapus data.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 mt-1 text-sm">Kelola penyimpanan data dan preferensi aplikasi Anda.</p>
      </div>

      <div className="space-y-6">
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Bantuan & Tur Interaktif</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Ingin memahami kembali cara menggunakan Madrasah dan setiap fiturnya? Anda dapat menjalankan ulang tur interaktif.
            </p>
            <Button onClick={startTour} variant="outline" className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Mulai Tur Panduan
            </Button>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Penyimpanan Lokal (IndexedDB)</h2>
          </div>
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-600">
              Semua data Anda (catatan, proyek, riset, dll.) disimpan secara aman di dalam peramban ini menggunakan teknologi <strong>IndexedDB</strong>. Data ini tidak dikirim ke server mana pun. Anda memiliki kendali penuh atas data Anda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-1">Cadangkan Data (Ekspor)</h3>
                <p className="text-xs text-gray-500 mb-4 h-8">
                  Unduh semua data Anda sebagai file JSON untuk disimpan dengan aman.
                </p>
                <Button onClick={handleExport} className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Ekspor Backup
                </Button>
                {exportStatus && (
                  <p className="text-xs mt-2 text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {exportStatus}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-1">Pulihkan Data (Impor)</h3>
                <p className="text-xs text-gray-500 mb-4 h-8">
                  Unggah file JSON backup sebelumnya. Data yang ada akan ditimpa.
                </p>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="w-full gap-2 pointer-events-none">
                    <Upload className="w-4 h-4" />
                    Pilih File JSON
                  </Button>
                </div>
                {importStatus && (
                  <p className={`text-xs mt-2 flex items-center gap-1 ${importStatus.includes('Gagal') ? 'text-red-600' : 'text-green-600'}`}>
                    <CheckCircle2 className="w-3 h-3" /> {importStatus}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-red-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Zona Bahaya
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    Menghapus seluruh data akan menghilangkan semua catatan, proyek, dan pengaturan secara permanen. Pastikan Anda telah melakukan ekspor data sebelumnya.
                  </p>
                </div>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300" onClick={handleClearData}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Semua Data
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
