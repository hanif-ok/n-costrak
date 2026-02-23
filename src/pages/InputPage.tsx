import { useState } from 'react'
import { clsx } from 'clsx'
import { Card } from '../components/ui/Card'
import { NumberInput } from '../components/ui/NumberInput'
import { useProfilStore, getRKAPAktif } from '../store/profilStore'
import { useInputStore } from '../store/inputStore'
import { NAMA_BULAN } from '../engine/types'
import { useAppStore } from '../store/appStore'

type Step = 'profil' | 'rkap' | 'targetBeban' | 'targetPremi' | 'realisasiBeban' | 'realisasiPremi' | 'tahunLalu' | 'proyeksi'

const steps: { id: Step; label: string }[] = [
  { id: 'profil', label: 'Profil Cabang' },
  { id: 'rkap', label: 'RKAP Tahunan' },
  { id: 'targetBeban', label: 'Target Beban YTD' },
  { id: 'targetPremi', label: 'Target Premi YTD' },
  { id: 'realisasiBeban', label: 'Realisasi Beban' },
  { id: 'realisasiPremi', label: 'Realisasi Premi' },
  { id: 'tahunLalu', label: 'Beban Tahun Lalu' },
  { id: 'proyeksi', label: 'Proyeksi Bulan' },
]

export function InputPage() {
  const [activeStep, setActiveStep] = useState<Step>('profil')
  const currentIndex = steps.findIndex((s) => s.id === activeStep)

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Input Data</h2>

      {/* Stepper */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={clsx(
              'px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
              i === currentIndex
                ? 'bg-askrindo text-white'
                : i < currentIndex
                  ? 'bg-blue-100 text-askrindo hover:bg-blue-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            )}
          >
            {i + 1}. {step.label}
          </button>
        ))}
      </div>

      {/* Step Content */}
      {activeStep === 'profil' && <ProfilForm />}
      {activeStep === 'rkap' && <RKAPForm />}
      {activeStep === 'targetBeban' && <TargetBebanForm />}
      {activeStep === 'targetPremi' && <TargetPremiForm />}
      {activeStep === 'realisasiBeban' && <RealisasiBebanForm />}
      {activeStep === 'realisasiPremi' && <RealisasiPremiForm />}
      {activeStep === 'tahunLalu' && <TahunLaluForm />}
      {activeStep === 'proyeksi' && <ProyeksiForm />}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => currentIndex > 0 && setActiveStep(steps[currentIndex - 1].id)}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sebelumnya
        </button>
        {currentIndex < steps.length - 1 ? (
          <button
            onClick={() => setActiveStep(steps[currentIndex + 1].id)}
            className="px-4 py-2 text-sm font-medium text-white bg-askrindo rounded-md hover:bg-askrindo-dark"
          >
            Selanjutnya
          </button>
        ) : (
          <button
            onClick={() => useAppStore.getState().setTabAktif('dasbor')}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Lihat Dasbor
          </button>
        )}
      </div>
    </div>
  )
}

function ProfilForm() {
  const profil = useProfilStore((s) => s.profil)
  const setProfil = useProfilStore((s) => s.setProfil)

  return (
    <Card title="Profil Cabang" subtitle="Informasi identitas cabang">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Cabang</label>
          <input
            type="text"
            value={profil.nama}
            onChange={(e) => setProfil({ nama: e.target.value })}
            placeholder="contoh: Cabang Cirebon"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-askrindo-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Wilayah / Kanwil</label>
          <input
            type="text"
            value={profil.wilayah}
            onChange={(e) => setProfil({ wilayah: e.target.value })}
            placeholder="contoh: Kanwil Jakarta II"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-askrindo-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Berjalan</label>
          <input
            type="number"
            value={profil.tahunBerjalan}
            onChange={(e) => setProfil({ tahunBerjalan: parseInt(e.target.value) || new Date().getFullYear() })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-askrindo-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Sebelumnya</label>
          <input
            type="number"
            value={profil.tahunSebelumnya}
            onChange={(e) => setProfil({ tahunSebelumnya: parseInt(e.target.value) || new Date().getFullYear() - 1 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-askrindo-light"
          />
        </div>
      </div>
    </Card>
  )
}

function RKAPForm() {
  const rkapRevisi = useProfilStore((s) => s.rkapRevisi)
  const setRKAP = useProfilStore((s) => s.setRKAP)
  const setRKAPAktif = useProfilStore((s) => s.setRKAPAktif)
  const buatRevisi = useProfilStore((s) => s.buatRevisiRKAP)
  const hapusRevisi = useProfilStore((s) => s.hapusRevisiRKAP)

  const versi = rkapRevisi.aktif
  const rkap = getRKAPAktif(useProfilStore.getState())

  return (
    <Card title="RKAP Tahunan" subtitle="Rencana Kerja Anggaran Perusahaan — anggaran beban pemasaran setahun (dalam juta Rupiah)">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setRKAPAktif('awal')}
          className={clsx('px-3 py-1.5 text-xs font-medium rounded-md', versi === 'awal' ? 'bg-askrindo text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
        >
          RKAP Awal
        </button>
        {rkapRevisi.revisi ? (
          <>
            <button
              onClick={() => setRKAPAktif('revisi')}
              className={clsx('px-3 py-1.5 text-xs font-medium rounded-md', versi === 'revisi' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
            >
              RKAP Revisi
            </button>
            <button
              onClick={() => { if (confirm('Hapus data RKAP Revisi?')) hapusRevisi() }}
              className="px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              Hapus Revisi
            </button>
          </>
        ) : (
          <button
            onClick={buatRevisi}
            className="px-3 py-1.5 text-xs font-medium text-askrindo bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
          >
            Buat Revisi RKAP
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Non KUR</label>
          <NumberInput value={rkap.nonKur} onChange={(v) => setRKAP(versi, 'nonKur', v ?? 0)} suffix="jt" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">KUR</label>
          <NumberInput value={rkap.kur} onChange={(v) => setRKAP(versi, 'kur', v ?? 0)} suffix="jt" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gabungan (otomatis)</label>
          <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-right text-slate-600 font-medium">
            {rkap.gabungan.toLocaleString('id-ID')} jt
          </div>
        </div>
      </div>
    </Card>
  )
}

function MonthlyGrid({
  title,
  subtitle,
  dataNonKur,
  dataKur,
  onChangeNonKur,
  onChangeKur,
}: {
  title: string
  subtitle: string
  dataNonKur: (number | null)[]
  dataKur: (number | null)[]
  onChangeNonKur: (bulan: number, nilai: number | null) => void
  onChangeKur: (bulan: number, nilai: number | null) => void
}) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-2 font-medium text-slate-600 w-24">Segmen</th>
              {NAMA_BULAN.map((bulan, i) => (
                <th key={i} className="text-center py-2 px-1 font-medium text-slate-600 text-xs">
                  {bulan.substring(0, 3)}
                </th>
              ))}
              <th className="text-center py-2 px-2 font-medium text-slate-700 text-xs border-l border-slate-300">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 px-2 font-medium text-slate-700 text-xs">Non KUR</td>
              {dataNonKur.map((val, i) => (
                <td key={i} className="py-1 px-0.5">
                  <NumberInput
                    value={val}
                    onChange={(v) => onChangeNonKur(i, v)}
                    placeholder="—"
                    className="!text-xs !px-1 !py-1"
                  />
                </td>
              ))}
              <td className="py-1 px-2 text-center text-xs font-semibold text-slate-700 border-l border-slate-300 bg-slate-50">
                {dataNonKur.some((v) => v !== null) ? dataNonKur.reduce<number>((sum, v) => sum + (v ?? 0), 0).toLocaleString('id-ID') : '—'}
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2 px-2 font-medium text-slate-700 text-xs">KUR</td>
              {dataKur.map((val, i) => (
                <td key={i} className="py-1 px-0.5">
                  <NumberInput
                    value={val}
                    onChange={(v) => onChangeKur(i, v)}
                    placeholder="—"
                    className="!text-xs !px-1 !py-1"
                  />
                </td>
              ))}
              <td className="py-1 px-2 text-center text-xs font-semibold text-slate-700 border-l border-slate-300 bg-slate-50">
                {dataKur.some((v) => v !== null) ? dataKur.reduce<number>((sum, v) => sum + (v ?? 0), 0).toLocaleString('id-ID') : '—'}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-2 font-medium text-slate-500 text-xs">Gabungan</td>
              {NAMA_BULAN.map((_, i) => {
                const nk = dataNonKur[i]
                const k = dataKur[i]
                const gab = nk !== null || k !== null ? ((nk ?? 0) + (k ?? 0)) : null
                return (
                  <td key={i} className="py-1 px-0.5 text-center text-xs text-slate-500">
                    {gab !== null ? gab.toLocaleString('id-ID') : '—'}
                  </td>
                )
              })}
              <td className="py-1 px-2 text-center text-xs font-semibold text-slate-500 border-l border-slate-300 bg-slate-50">
                {dataNonKur.some((v) => v !== null) || dataKur.some((v) => v !== null)
                  ? (dataNonKur.reduce<number>((sum, v) => sum + (v ?? 0), 0) + dataKur.reduce<number>((sum, v) => sum + (v ?? 0), 0)).toLocaleString('id-ID')
                  : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-2">Semua angka dalam juta Rupiah. Kosongkan jika belum ada data.</p>
    </Card>
  )
}

function TargetBebanForm() {
  const targetBeban = useProfilStore((s) => s.targetBebanYTD)
  const setTarget = useProfilStore((s) => s.setTargetBebanYTD)
  return (
    <MonthlyGrid
      title="Target Beban YTD per Bulan"
      subtitle="Target beban pemasaran kumulatif YTD per bulan per segmen (dalam juta Rupiah)"
      dataNonKur={targetBeban.nonKur}
      dataKur={targetBeban.kur}
      onChangeNonKur={(b, v) => setTarget('nonKur', b, v)}
      onChangeKur={(b, v) => setTarget('kur', b, v)}
    />
  )
}

function TargetPremiForm() {
  const targetPremi = useProfilStore((s) => s.targetPremiYTD)
  const setTarget = useProfilStore((s) => s.setTargetPremiYTD)
  return (
    <MonthlyGrid
      title="Target Premi YTD per Bulan"
      subtitle="Target premi kumulatif YTD per bulan per segmen (dalam juta Rupiah)"
      dataNonKur={targetPremi.nonKur}
      dataKur={targetPremi.kur}
      onChangeNonKur={(b, v) => setTarget('nonKur', b, v)}
      onChangeKur={(b, v) => setTarget('kur', b, v)}
    />
  )
}

function RealisasiBebanForm() {
  const realisasi = useInputStore((s) => s.realisasiBeban)
  const setRealisasi = useInputStore((s) => s.setRealisasiBeban)
  return (
    <MonthlyGrid
      title="Realisasi Beban per Bulan"
      subtitle="Realisasi beban pemasaran per bulan (BUKAN kumulatif) per segmen (dalam juta Rupiah)"
      dataNonKur={realisasi.nonKur}
      dataKur={realisasi.kur}
      onChangeNonKur={(b, v) => setRealisasi('nonKur', b, v)}
      onChangeKur={(b, v) => setRealisasi('kur', b, v)}
    />
  )
}

function RealisasiPremiForm() {
  const realisasi = useInputStore((s) => s.realisasiPremi)
  const setRealisasi = useInputStore((s) => s.setRealisasiPremi)
  return (
    <MonthlyGrid
      title="Realisasi Premi per Bulan"
      subtitle="Realisasi premi per bulan (BUKAN kumulatif) per segmen (dalam juta Rupiah)"
      dataNonKur={realisasi.nonKur}
      dataKur={realisasi.kur}
      onChangeNonKur={(b, v) => setRealisasi('nonKur', b, v)}
      onChangeKur={(b, v) => setRealisasi('kur', b, v)}
    />
  )
}

function TahunLaluForm() {
  const tahunLalu = useInputStore((s) => s.realisasiBebanTahunLalu)
  const setTahunLalu = useInputStore((s) => s.setRealisasiBebanTahunLalu)
  const tahun = useProfilStore((s) => s.profil.tahunSebelumnya)
  return (
    <MonthlyGrid
      title={`Realisasi Beban Tahun ${tahun}`}
      subtitle={`Data beban pemasaran per bulan tahun ${tahun} per segmen untuk perhitungan YoY (dalam juta Rupiah)`}
      dataNonKur={tahunLalu.nonKur}
      dataKur={tahunLalu.kur}
      onChangeNonKur={(b, v) => setTahunLalu('nonKur', b, v)}
      onChangeKur={(b, v) => setTahunLalu('kur', b, v)}
    />
  )
}

function ProyeksiForm() {
  const proyeksi = useInputStore((s) => s.proyeksi)
  const setProyeksi = useInputStore((s) => s.setProyeksi)
  const setProyeksiBulan = useInputStore((s) => s.setProyeksiBulan)

  return (
    <Card title="Proyeksi Paruh Bulan" subtitle="Masukkan data paruh bulan untuk proyeksi akhir bulan berjalan">
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Bulan Berjalan</label>
        <select
          value={proyeksi.bulanIndex}
          onChange={(e) => setProyeksiBulan(parseInt(e.target.value))}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-askrindo-light"
        >
          {NAMA_BULAN.map((bulan, i) => (
            <option key={i} value={i}>{bulan}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-slate-700 mb-3">Non KUR</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Realisasi Tgl 1-15 (juta Rp)</label>
              <NumberInput
                value={proyeksi.nonKur.realParuh1}
                onChange={(v) => setProyeksi('nonKur', 'realParuh1', v ?? 0)}
                suffix="jt"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Potensi Tgl 16-31 (juta Rp)</label>
              <NumberInput
                value={proyeksi.nonKur.potensiParuh2}
                onChange={(v) => setProyeksi('nonKur', 'potensiParuh2', v ?? 0)}
                suffix="jt"
              />
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-slate-700 mb-3">KUR</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Realisasi Tgl 1-15 (juta Rp)</label>
              <NumberInput
                value={proyeksi.kur.realParuh1}
                onChange={(v) => setProyeksi('kur', 'realParuh1', v ?? 0)}
                suffix="jt"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Potensi Tgl 16-31 (juta Rp)</label>
              <NumberInput
                value={proyeksi.kur.potensiParuh2}
                onChange={(v) => setProyeksi('kur', 'potensiParuh2', v ?? 0)}
                suffix="jt"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
