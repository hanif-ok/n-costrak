import { useProfilStore, getRKAPAktif } from '../store/profilStore'
import { useInputStore } from '../store/inputStore'
import { useAppStore } from '../store/appStore'
import { useBPRData } from '../hooks/useBPRData'
import { formatAngka, formatPersen, formatJutaRupiah, formatTanggal } from '../lib/formatAngka'
import { NAMA_BULAN } from '../engine/types'
import { hitungRealisasiYTD } from '../engine/nominal'
import type { StatusRAG } from '../engine/types'

function statusLabel(status: StatusRAG): string {
  if (status === 'aman') return 'Sehat'
  if (status === 'perhatian') return 'Waspada'
  return 'Bahaya'
}

export function PrintLayout() {
  const profil = useProfilStore((s) => s.profil)
  const rkap = useProfilStore((s) => getRKAPAktif(s))
  const rkapVersi = useProfilStore((s) => s.rkapRevisi.aktif)
  const hasRevisi = useProfilStore((s) => s.rkapRevisi.revisi !== null)
  const bulanAktif = useAppStore((s) => s.bulanAktif)
  const targetBeban = useProfilStore((s) => s.targetBebanYTD)
  const targetPremi = useProfilStore((s) => s.targetPremiYTD)
  const realisasiBeban = useInputStore((s) => s.realisasiBeban)
  const realisasiPremi = useInputStore((s) => s.realisasiPremi)
  const realisasiTahunLalu = useInputStore((s) => s.realisasiBebanTahunLalu)
  const data = useBPRData()

  return (
    <div className="print-only">
      {/* Header */}
      <div className="print-header">
        <h1 style={{ fontSize: '16px', margin: '0 0 4px 0', fontWeight: 'bold' }}>
          Laporan PINTAR
        </h1>
        <p style={{ fontSize: '12px', margin: '2px 0' }}>
          {profil.nama || '—'} — {profil.wilayah || '—'}
        </p>
        <p style={{ fontSize: '11px', margin: '2px 0', color: '#666' }}>
          Tahun {profil.tahunBerjalan} — Periode s.d. {NAMA_BULAN[bulanAktif]}
          {hasRevisi && ` — RKAP ${rkapVersi === 'revisi' ? 'Revisi' : 'Awal'}`}
        </p>
        <p style={{ fontSize: '10px', margin: '2px 0', color: '#999' }}>
          Dicetak: {formatTanggal(new Date())}
        </p>
      </div>

      {/* KPI Summary */}
      <div style={{ marginTop: '16px' }}>
        <h2 className="print-section-title">Ringkasan KPI</h2>
        <table className="print-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Nilai</th>
              <th>Target</th>
              <th>Pencapaian</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nominal Beban (Gabungan)</td>
              <td style={{ textAlign: 'right' }}>{formatJutaRupiah(data.gabungan.nominal.realisasiYTD)}</td>
              <td style={{ textAlign: 'right' }}>{formatJutaRupiah(data.gabungan.nominal.targetYTD)}</td>
              <td style={{ textAlign: 'right' }}>{formatPersen(data.gabungan.nominal.pencapaianPersen)}</td>
              <td style={{ textAlign: 'center' }}>{statusLabel(data.gabungan.nominal.status)}</td>
            </tr>
            <tr>
              <td>Rasio Beban / Premi (Gabungan)</td>
              <td style={{ textAlign: 'right' }}>{formatPersen(data.gabungan.rasio.rasioRealisasi)}</td>
              <td style={{ textAlign: 'right' }}>{formatPersen(data.gabungan.rasio.rasioTarget)}</td>
              <td style={{ textAlign: 'right' }}>{formatPersen(data.gabungan.rasio.pencapaianRasio)}</td>
              <td style={{ textAlign: 'center' }}>{statusLabel(data.gabungan.rasio.status)}</td>
            </tr>
            <tr>
              <td>Pertumbuhan YoY (Gabungan)</td>
              <td style={{ textAlign: 'right' }}>{formatPersen(data.gabungan.yoy.pertumbuhanPersen)}</td>
              <td style={{ textAlign: 'right' }}>—</td>
              <td style={{ textAlign: 'right' }}>—</td>
              <td style={{ textAlign: 'center' }}>{statusLabel(data.gabungan.yoy.status)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabel Nominal */}
      <div style={{ marginTop: '16px' }}>
        <h2 className="print-section-title">Tabel Nominal</h2>
        <table className="print-table">
          <thead>
            <tr>
              <th>Segmen</th>
              <th>Realisasi YTD</th>
              <th>Target YTD</th>
              <th>% YTD</th>
              <th>RKAP</th>
              <th>% RKAP</th>
              <th>Sisa Anggaran</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Non KUR', nom: data.nonKur.nominal, rkapVal: rkap.nonKur },
              { label: 'KUR', nom: data.kur.nominal, rkapVal: rkap.kur },
              { label: 'Gabungan', nom: data.gabungan.nominal, rkapVal: rkap.gabungan },
            ].map((r) => (
              <tr key={r.label} style={r.label === 'Gabungan' ? { fontWeight: 'bold' } : undefined}>
                <td>{r.label}</td>
                <td style={{ textAlign: 'right' }}>{formatAngka(r.nom.realisasiYTD)}</td>
                <td style={{ textAlign: 'right' }}>{formatAngka(r.nom.targetYTD)}</td>
                <td style={{ textAlign: 'right' }}>{formatPersen(r.nom.pencapaianPersen)}</td>
                <td style={{ textAlign: 'right' }}>{formatAngka(r.rkapVal)}</td>
                <td style={{ textAlign: 'right' }}>{formatPersen(r.nom.pencapaianRKAP)}</td>
                <td style={{ textAlign: 'right' }}>{formatAngka(r.nom.sisaAnggaran)}</td>
                <td style={{ textAlign: 'center' }}>{statusLabel(r.nom.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabel Rasio */}
      <div style={{ marginTop: '16px', pageBreakBefore: 'auto' }}>
        <h2 className="print-section-title">Tabel Rasio — {NAMA_BULAN[bulanAktif]}</h2>
        <table className="print-table">
          <thead>
            <tr>
              <th>Segmen</th>
              <th>Premi Target</th>
              <th>Beban Target</th>
              <th>Rasio Target</th>
              <th>Premi Real</th>
              <th>Beban Real</th>
              <th>Rasio Real</th>
              <th>Pencapaian</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: 'Non KUR',
                premiTarget: targetPremi.nonKur[bulanAktif], bebanTarget: targetBeban.nonKur[bulanAktif],
                premiReal: hitungRealisasiYTD(realisasiPremi.nonKur, bulanAktif),
                bebanReal: hitungRealisasiYTD(realisasiBeban.nonKur, bulanAktif),
                rasio: data.nonKur.rasio,
              },
              {
                label: 'KUR',
                premiTarget: targetPremi.kur[bulanAktif], bebanTarget: targetBeban.kur[bulanAktif],
                premiReal: hitungRealisasiYTD(realisasiPremi.kur, bulanAktif),
                bebanReal: hitungRealisasiYTD(realisasiBeban.kur, bulanAktif),
                rasio: data.kur.rasio,
              },
              {
                label: 'Gabungan',
                premiTarget: ((targetPremi.nonKur[bulanAktif] ?? 0) + (targetPremi.kur[bulanAktif] ?? 0)) || null,
                bebanTarget: ((targetBeban.nonKur[bulanAktif] ?? 0) + (targetBeban.kur[bulanAktif] ?? 0)) || null,
                premiReal: hitungRealisasiYTD(realisasiPremi.nonKur, bulanAktif) + hitungRealisasiYTD(realisasiPremi.kur, bulanAktif),
                bebanReal: hitungRealisasiYTD(realisasiBeban.nonKur, bulanAktif) + hitungRealisasiYTD(realisasiBeban.kur, bulanAktif),
                rasio: data.gabungan.rasio,
              },
            ].map((r) => (
              <tr key={r.label} style={r.label === 'Gabungan' ? { fontWeight: 'bold' } : undefined}>
                <td>{r.label}</td>
                <td style={{ textAlign: 'right' }}>{formatAngka(r.premiTarget)}</td>
                <td style={{ textAlign: 'right' }}>{formatAngka(r.bebanTarget)}</td>
                <td style={{ textAlign: 'right' }}>{formatPersen(r.rasio.rasioTarget)}</td>
                <td style={{ textAlign: 'right' }}>{formatAngka(r.premiReal)}</td>
                <td style={{ textAlign: 'right' }}>{formatAngka(r.bebanReal)}</td>
                <td style={{ textAlign: 'right' }}>{formatPersen(r.rasio.rasioRealisasi)}</td>
                <td style={{ textAlign: 'right' }}>{formatPersen(r.rasio.pencapaianRasio)}</td>
                <td style={{ textAlign: 'center' }}>{statusLabel(r.rasio.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabel YoY */}
      <div style={{ marginTop: '16px' }}>
        <h2 className="print-section-title">Tabel Year-on-Year (Gabungan)</h2>
        <table className="print-table">
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Realisasi {profil.tahunSebelumnya}</th>
              <th>Realisasi {profil.tahunBerjalan}</th>
              <th>Selisih</th>
              <th>% Pertumbuhan</th>
            </tr>
          </thead>
          <tbody>
            {NAMA_BULAN.map((bulan, i) => {
              const lalu = (realisasiTahunLalu.nonKur[i] ?? 0) + (realisasiTahunLalu.kur[i] ?? 0)
              const ini = (realisasiBeban.nonKur[i] ?? 0) + (realisasiBeban.kur[i] ?? 0)
              const hasData = realisasiBeban.nonKur[i] !== null || realisasiBeban.kur[i] !== null ||
                              realisasiTahunLalu.nonKur[i] !== null || realisasiTahunLalu.kur[i] !== null
              const selisih = ini - lalu
              const persen = lalu > 0 ? Math.round(((ini - lalu) / lalu) * 10000) / 100 : null

              return (
                <tr key={i}>
                  <td>{bulan}</td>
                  <td style={{ textAlign: 'right' }}>{hasData ? formatAngka(lalu) : '—'}</td>
                  <td style={{ textAlign: 'right' }}>{hasData ? formatAngka(ini) : '—'}</td>
                  <td style={{ textAlign: 'right' }}>{hasData ? formatAngka(selisih) : '—'}</td>
                  <td style={{ textAlign: 'right' }}>{persen !== null ? formatPersen(persen) : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Peringatan */}
      {data.peringatan.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h2 className="print-section-title">Peringatan</h2>
          <ul style={{ fontSize: '10px', paddingLeft: '16px', margin: '4px 0' }}>
            {data.peringatan.map((p, i) => (
              <li key={i}>{p.pesan}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
