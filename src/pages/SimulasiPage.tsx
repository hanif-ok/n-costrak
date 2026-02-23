import { useMemo } from 'react'
import { Card } from '../components/ui/Card'
import { NumberInput } from '../components/ui/NumberInput'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useSimulasiStore } from '../store/simulasiStore'
import { useInputStore } from '../store/inputStore'
import { useProfilStore, getRKAPAktif } from '../store/profilStore'
import { useAppStore } from '../store/appStore'
import { NAMA_BULAN } from '../engine/types'
import { hitungNominal, hitungNominalGabungan } from '../engine/nominal'
import { hitungRasio, hitungRasioGabungan } from '../engine/rasio'
import { hitungYoY, hitungYoYGabungan } from '../engine/yoy'
import { formatJutaRupiah, formatPersen, formatAngka } from '../lib/formatAngka'
import { clsx } from 'clsx'
import type { DataBulanan } from '../engine/types'

export function SimulasiPage() {
  const simulasi = useSimulasiStore()
  const bulanAktif = useAppStore((s) => s.bulanAktif)
  const rkap = useProfilStore((s) => getRKAPAktif(s))
  const targetBeban = useProfilStore((s) => s.targetBebanYTD)
  const targetPremi = useProfilStore((s) => s.targetPremiYTD)
  const realisasiBeban = useInputStore((s) => s.realisasiBeban)
  const realisasiPremi = useInputStore((s) => s.realisasiPremi)
  const tahunLalu = useInputStore((s) => s.realisasiBebanTahunLalu)

  const hasil = useMemo(() => {
    // Create modified data with simulation overrides
    const simBebanNK: DataBulanan = [...realisasiBeban.nonKur]
    const simBebanK: DataBulanan = [...realisasiBeban.kur]
    const simPremiNK: DataBulanan = [...realisasiPremi.nonKur]
    const simPremiK: DataBulanan = [...realisasiPremi.kur]

    if (simulasi.aktif) {
      if (simulasi.overrideBeban.nonKur !== null) {
        simBebanNK[bulanAktif] = simulasi.overrideBeban.nonKur
      }
      if (simulasi.overrideBeban.kur !== null) {
        simBebanK[bulanAktif] = simulasi.overrideBeban.kur
      }
      if (simulasi.overridePremi.nonKur !== null) {
        simPremiNK[bulanAktif] = simulasi.overridePremi.nonKur
      }
      if (simulasi.overridePremi.kur !== null) {
        simPremiK[bulanAktif] = simulasi.overridePremi.kur
      }
    }

    const nomNK = hitungNominal(simBebanNK, targetBeban.nonKur, rkap.nonKur, bulanAktif)
    const nomK = hitungNominal(simBebanK, targetBeban.kur, rkap.kur, bulanAktif)
    const nomGab = hitungNominalGabungan(nomNK, nomK, rkap.gabungan)

    const rasNK = hitungRasio(simBebanNK, simPremiNK, targetBeban.nonKur, targetPremi.nonKur, bulanAktif)
    const rasK = hitungRasio(simBebanK, simPremiK, targetBeban.kur, targetPremi.kur, bulanAktif)
    const rasGab = hitungRasioGabungan(simBebanNK, simBebanK, simPremiNK, simPremiK, targetBeban.nonKur, targetBeban.kur, targetPremi.nonKur, targetPremi.kur, bulanAktif)

    const yoyNK = hitungYoY(simBebanNK, tahunLalu.nonKur, bulanAktif)
    const yoyK = hitungYoY(simBebanK, tahunLalu.kur, bulanAktif)
    const yoyGab = hitungYoYGabungan(yoyNK, yoyK)

    // Calculate minimum premium needed for safe ratio
    const totalBeban = nomGab.realisasiYTD
    const rasioTargetGab = rasGab.rasioTarget
    const premiMinimal = rasioTargetGab && rasioTargetGab > 0 ? Math.round((totalBeban / (rasioTargetGab / 100)) * 100) / 100 : null

    return {
      nonKur: { nominal: nomNK, rasio: rasNK, yoy: yoyNK },
      kur: { nominal: nomK, rasio: rasK, yoy: yoyK },
      gabungan: { nominal: nomGab, rasio: rasGab, yoy: yoyGab },
      premiMinimal,
    }
  }, [simulasi, bulanAktif, rkap, targetBeban, targetPremi, realisasiBeban, realisasiPremi, tahunLalu])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Simulasi "Bagaimana Jika"</h2>
          <p className="text-sm text-slate-500">Masukkan nilai hipotetis untuk melihat dampaknya pada parameter BPR</p>
        </div>
        <div className="flex gap-2">
          {!simulasi.aktif ? (
            <button
              onClick={() => simulasi.setAktif(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-md hover:bg-amber-600"
            >
              Mulai Simulasi
            </button>
          ) : (
            <>
              <button
                onClick={() => simulasi.resetSimulasi()}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Batal Simulasi
              </button>
              <button
                onClick={() => {
                  // Apply simulation values to real store
                  const store = useInputStore.getState()
                  if (simulasi.overrideBeban.nonKur !== null)
                    store.setRealisasiBeban('nonKur', bulanAktif, simulasi.overrideBeban.nonKur)
                  if (simulasi.overrideBeban.kur !== null)
                    store.setRealisasiBeban('kur', bulanAktif, simulasi.overrideBeban.kur)
                  if (simulasi.overridePremi.nonKur !== null)
                    store.setRealisasiPremi('nonKur', bulanAktif, simulasi.overridePremi.nonKur)
                  if (simulasi.overridePremi.kur !== null)
                    store.setRealisasiPremi('kur', bulanAktif, simulasi.overridePremi.kur)
                  simulasi.resetSimulasi()
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Terapkan ke Data
              </button>
            </>
          )}
        </div>
      </div>

      {simulasi.aktif && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800 font-medium">
            Mode simulasi aktif — perubahan di bawah TIDAK mengubah data asli sampai Anda klik "Terapkan ke Data"
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Input simulasi */}
        <Card title={`Simulasi Bulan ${NAMA_BULAN[bulanAktif]}`} subtitle="Masukkan nilai hipotetis beban dan premi">
          <div className="space-y-4">
            <h4 className="font-medium text-slate-700">Beban Pemasaran (juta Rp)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Non KUR</label>
                <NumberInput
                  value={simulasi.overrideBeban.nonKur ?? realisasiBeban.nonKur[bulanAktif]}
                  onChange={(v) => simulasi.setOverrideBeban('nonKur', v)}
                  disabled={!simulasi.aktif}
                  suffix="jt"
                />
                <p className="text-xs text-slate-400 mt-0.5">Saat ini: {formatAngka(realisasiBeban.nonKur[bulanAktif])}</p>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">KUR</label>
                <NumberInput
                  value={simulasi.overrideBeban.kur ?? realisasiBeban.kur[bulanAktif]}
                  onChange={(v) => simulasi.setOverrideBeban('kur', v)}
                  disabled={!simulasi.aktif}
                  suffix="jt"
                />
                <p className="text-xs text-slate-400 mt-0.5">Saat ini: {formatAngka(realisasiBeban.kur[bulanAktif])}</p>
              </div>
            </div>

            <h4 className="font-medium text-slate-700 mt-4">Premi (juta Rp)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Non KUR</label>
                <NumberInput
                  value={simulasi.overridePremi.nonKur ?? realisasiPremi.nonKur[bulanAktif]}
                  onChange={(v) => simulasi.setOverridePremi('nonKur', v)}
                  disabled={!simulasi.aktif}
                  suffix="jt"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">KUR</label>
                <NumberInput
                  value={simulasi.overridePremi.kur ?? realisasiPremi.kur[bulanAktif]}
                  onChange={(v) => simulasi.setOverridePremi('kur', v)}
                  disabled={!simulasi.aktif}
                  suffix="jt"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Hasil simulasi */}
        <Card title="Hasil Simulasi" subtitle="Dampak pada ketiga parameter BPR">
          <div className="space-y-4">
            <div className={clsx('p-3 rounded-lg border', {
              'bg-green-50 border-green-200': hasil.gabungan.nominal.status === 'aman',
              'bg-yellow-50 border-yellow-200': hasil.gabungan.nominal.status === 'perhatian',
              'bg-red-50 border-red-200': hasil.gabungan.nominal.status === 'bahaya',
            })}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Nominal</span>
                <StatusBadge status={hasil.gabungan.nominal.status} />
              </div>
              <p className="text-lg font-bold mt-1">{formatPersen(hasil.gabungan.nominal.pencapaianPersen)}</p>
              <p className="text-xs text-slate-500">
                Realisasi: {formatJutaRupiah(hasil.gabungan.nominal.realisasiYTD)} / Target: {formatJutaRupiah(hasil.gabungan.nominal.targetYTD)}
              </p>
              <p className={clsx('text-xs font-medium mt-1', hasil.gabungan.nominal.sisaAnggaran < 0 ? 'text-red-600' : 'text-green-600')}>
                Sisa Anggaran: {formatJutaRupiah(hasil.gabungan.nominal.sisaAnggaran)}
              </p>
            </div>

            <div className={clsx('p-3 rounded-lg border', {
              'bg-green-50 border-green-200': hasil.gabungan.rasio.status === 'aman',
              'bg-yellow-50 border-yellow-200': hasil.gabungan.rasio.status === 'perhatian',
              'bg-red-50 border-red-200': hasil.gabungan.rasio.status === 'bahaya',
            })}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Rasio</span>
                <StatusBadge status={hasil.gabungan.rasio.status} />
              </div>
              <p className="text-lg font-bold mt-1">{formatPersen(hasil.gabungan.rasio.pencapaianRasio)}</p>
              <p className="text-xs text-slate-500">
                Rasio: {formatPersen(hasil.gabungan.rasio.rasioRealisasi)} (Target: {formatPersen(hasil.gabungan.rasio.rasioTarget)})
              </p>
              {hasil.premiMinimal && (
                <p className="text-xs text-blue-600 mt-1">
                  Premi minimal agar rasio aman: {formatJutaRupiah(hasil.premiMinimal)}
                </p>
              )}
            </div>

            <div className={clsx('p-3 rounded-lg border', {
              'bg-green-50 border-green-200': hasil.gabungan.yoy.status === 'aman',
              'bg-red-50 border-red-200': hasil.gabungan.yoy.status === 'bahaya',
            })}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pertumbuhan YoY</span>
                <StatusBadge status={hasil.gabungan.yoy.status} />
              </div>
              <p className="text-lg font-bold mt-1">{formatPersen(hasil.gabungan.yoy.pertumbuhanPersen)}</p>
              <p className="text-xs text-slate-500">
                Tahun ini: {formatJutaRupiah(hasil.gabungan.yoy.realisasiTahunIni)} vs Tahun lalu: {formatJutaRupiah(hasil.gabungan.yoy.realisasiTahunLalu)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detail per segmen */}
      <Card title="Detail per Segmen" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="text-left py-2 px-2">Segmen</th>
                <th className="text-right py-2 px-2">% Nominal</th>
                <th className="text-right py-2 px-2">Sisa Anggaran</th>
                <th className="text-right py-2 px-2">Rasio</th>
                <th className="text-right py-2 px-2">% Pencapaian Rasio</th>
                <th className="text-right py-2 px-2">% YoY</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Non KUR', data: hasil.nonKur },
                { label: 'KUR', data: hasil.kur },
                { label: 'Gabungan', data: hasil.gabungan },
              ].map((r) => (
                <tr key={r.label} className={clsx('border-b border-slate-100', r.label === 'Gabungan' && 'bg-slate-50 font-medium')}>
                  <td className="py-2 px-2">{r.label}</td>
                  <td className="py-2 px-2 text-right">{formatPersen(r.data.nominal.pencapaianPersen)}</td>
                  <td className={clsx('py-2 px-2 text-right', r.data.nominal.sisaAnggaran < 0 ? 'text-red-600' : 'text-green-600')}>
                    {formatAngka(r.data.nominal.sisaAnggaran)}
                  </td>
                  <td className="py-2 px-2 text-right">{formatPersen(r.data.rasio.rasioRealisasi)}</td>
                  <td className="py-2 px-2 text-right">{formatPersen(r.data.rasio.pencapaianRasio)}</td>
                  <td className={clsx('py-2 px-2 text-right', r.data.yoy.pertumbuhanPersen !== null && r.data.yoy.pertumbuhanPersen > 0 ? 'text-red-600' : 'text-green-600')}>
                    {formatPersen(r.data.yoy.pertumbuhanPersen)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
