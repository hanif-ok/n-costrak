import { useCallback, useRef, useState } from 'react'
import { Card } from '../components/ui/Card'
import { useProfilStore, getRKAPAktif } from '../store/profilStore'
import { useInputStore } from '../store/inputStore'
import { buildExportData, applyImportData, generateFilename } from '../lib/dataIO'
import { eksporXLSXToFile, imporXLSX } from '../lib/xlsxIO'
import { ProfilManager } from '../components/ProfilManager'

export function DataPage() {
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'error'; teks: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const eksporJSON = useCallback(() => {
    try {
      const data = buildExportData()
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const filename = generateFilename('json')

      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      setPesan({ tipe: 'sukses', teks: `Data berhasil diekspor ke ${filename}` })
    } catch {
      setPesan({ tipe: 'error', teks: 'Gagal mengekspor data. Silakan coba lagi.' })
    }
  }, [])

  const eksporXLSX = useCallback(() => {
    try {
      const data = buildExportData()
      const filename = generateFilename('xlsx')
      eksporXLSXToFile(data, filename)
      setPesan({ tipe: 'sukses', teks: `Data berhasil diekspor ke ${filename}` })
    } catch {
      setPesan({ tipe: 'error', teks: 'Gagal mengekspor data ke XLSX. Silakan coba lagi.' })
    }
  }, [])

  const imporFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const ext = file.name.split('.').pop()?.toLowerCase()

      if (ext === 'xlsx' || ext === 'xls') {
        const data = await imporXLSX(file)
        applyImportData(data)
        setPesan({ tipe: 'sukses', teks: `Data berhasil dimuat dari ${file.name}` })
      } else {
        // JSON import
        const text = await file.text()
        const json = JSON.parse(text)

        if (!json.versi || !json.profil || !json.rkap) {
          throw new Error('Format file tidak valid')
        }

        applyImportData(json)
        setPesan({ tipe: 'sukses', teks: `Data berhasil dimuat dari ${file.name}` })
      }
    } catch (err) {
      setPesan({ tipe: 'error', teks: `Gagal memuat file: ${err instanceof Error ? err.message : 'Format tidak valid'}` })
    }

    // Reset file input
    if (fileRef.current) fileRef.current.value = ''
  }, [])

  const resetData = useCallback(() => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
      useProfilStore.getState().resetSemua()
      useInputStore.getState().resetSemua()
      setPesan({ tipe: 'sukses', teks: 'Semua data telah direset.' })
    }
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Kelola Data</h2>

      {pesan && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium border ${
          pesan.tipe === 'sukses'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {pesan.teks}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Ekspor Data" subtitle="Unduh data cabang ke komputer Anda">
          <div className="space-y-3">
            <button
              onClick={eksporJSON}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-askrindo rounded-md hover:bg-askrindo-dark flex items-center justify-center gap-2"
            >
              Ekspor ke JSON
            </button>
            <button
              onClick={eksporXLSX}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
            >
              Ekspor ke XLSX
            </button>
            <p className="text-xs text-slate-500">
              File JSON/XLSX berisi seluruh data cabang. Simpan file ini sebagai backup.
            </p>
          </div>
        </Card>

        <Card title="Muat Data" subtitle="Impor data dari file yang sudah disimpan">
          <div className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept=".json,.xlsx,.xls"
              onChange={imporFile}
              className="hidden"
              id="import-file"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full px-4 py-3 text-sm font-medium text-askrindo bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center justify-center gap-2"
            >
              Muat dari File (JSON / XLSX)
            </button>
            <p className="text-xs text-slate-500">
              Pilih file JSON atau XLSX yang sudah diekspor sebelumnya. Data saat ini akan ditimpa.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <ProfilManager />
      </div>

      <Card title="Data Saat Ini" subtitle="Ringkasan data yang tersimpan di browser" className="mt-6">
        <ProfilSummary />
      </Card>

      <Card title="Reset Data" subtitle="Hapus semua data dan mulai dari awal" className="mt-6">
        <button
          onClick={resetData}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
        >
          Hapus Semua Data
        </button>
        <p className="text-xs text-slate-500 mt-2">
          Pastikan Anda sudah mengekspor data sebelum menghapus. Tindakan ini tidak dapat dibatalkan.
        </p>
      </Card>
    </div>
  )
}

function ProfilSummary() {
  const profil = useProfilStore((s) => s.profil)
  const rkap = useProfilStore((s) => getRKAPAktif(s))
  const realisasiBeban = useInputStore((s) => s.realisasiBeban)

  const bulanTerisi = realisasiBeban.nonKur.filter((v) => v !== null).length +
    realisasiBeban.kur.filter((v) => v !== null).length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <p className="text-slate-500 text-xs">Cabang</p>
        <p className="font-medium">{profil.nama || '(belum diisi)'}</p>
      </div>
      <div>
        <p className="text-slate-500 text-xs">Wilayah</p>
        <p className="font-medium">{profil.wilayah || '(belum diisi)'}</p>
      </div>
      <div>
        <p className="text-slate-500 text-xs">Tahun</p>
        <p className="font-medium">{profil.tahunBerjalan}</p>
      </div>
      <div>
        <p className="text-slate-500 text-xs">RKAP Gabungan</p>
        <p className="font-medium">{rkap.gabungan > 0 ? `${rkap.gabungan.toLocaleString('id-ID')} jt` : '(belum diisi)'}</p>
      </div>
      <div>
        <p className="text-slate-500 text-xs">Data Realisasi Terisi</p>
        <p className="font-medium">{bulanTerisi} sel</p>
      </div>
      <div>
        <p className="text-slate-500 text-xs">Penyimpanan</p>
        <p className="font-medium text-green-600">localStorage aktif</p>
      </div>
    </div>
  )
}
