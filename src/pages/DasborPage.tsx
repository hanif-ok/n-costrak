import { Card } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useBPRData } from '../hooks/useBPRData'
import { useProfilStore, getRKAPAktif } from '../store/profilStore'
import { useInputStore } from '../store/inputStore'
import { useAppStore } from '../store/appStore'
import { formatJutaRupiah, formatPersen, formatAngka } from '../lib/formatAngka'
import { NAMA_BULAN } from '../engine/types'
import { hitungRealisasiYTD } from '../engine/nominal'
import { GrafikBebanVsTarget } from '../components/charts/GrafikBebanVsTarget'
import { GrafikRasioTren } from '../components/charts/GrafikRasioTren'
import { GrafikYoY } from '../components/charts/GrafikYoY'
import { GrafikKumulatifYTD } from '../components/charts/GrafikKumulatifYTD'
import { clsx } from 'clsx'
import type { StatusRAG, HasilNominal } from '../engine/types'

export function DasborPage() {
  const data = useBPRData()
  const namaCabang = useProfilStore((s) => s.profil.nama)
  const rkapVersi = useProfilStore((s) => s.rkapRevisi.aktif)
  const hasRevisi = useProfilStore((s) => s.rkapRevisi.revisi !== null)
  const bulanAktif = useAppStore((s) => s.bulanAktif)
  const setBulanAktif = useAppStore((s) => s.setBulanAktif)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-800">Dasbor</h2>
            {hasRevisi && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                rkapVersi === 'revisi' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                RKAP {rkapVersi === 'revisi' ? 'Revisi' : 'Awal'}
              </span>
            )}
          </div>
          {namaCabang && <p className="text-sm text-slate-500">{namaCabang}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-sm font-medium text-askrindo bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 no-print"
          >
            Cetak Laporan
          </button>
          <label className="text-sm text-slate-600">Periode s.d.</label>
          <select
            value={bulanAktif}
            onChange={(e) => setBulanAktif(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-askrindo-light"
          >
            {NAMA_BULAN.map((bulan, i) => (
              <option key={i} value={i}>{bulan}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Peringatan */}
      {data.peringatan.length > 0 && (
        <div className="mb-6 space-y-2">
          {data.peringatan.map((p, i) => (
            <div
              key={i}
              className={clsx(
                'px-4 py-3 rounded-lg text-sm font-medium border',
                p.tipe === 'bahaya' && 'bg-red-50 text-red-800 border-red-200',
                p.tipe === 'perhatian' && 'bg-yellow-50 text-yellow-800 border-yellow-200'
              )}
            >
              {p.pesan}
            </div>
          ))}
          {data.bulanMelebihiTarget && (
            <div className="px-4 py-3 rounded-lg text-sm font-medium border bg-orange-50 text-orange-800 border-orange-200">
              Dengan laju saat ini, beban gabungan diproyeksikan melebihi target pada bulan {data.bulanMelebihiTarget}
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard
          title="Nominal Beban"
          subtitle={`Realisasi YTD s.d. ${NAMA_BULAN[bulanAktif]}`}
          value={formatJutaRupiah(data.gabungan.nominal.realisasiYTD)}
          detail={`dari target ${formatJutaRupiah(data.gabungan.nominal.targetYTD)}`}
          persen={data.gabungan.nominal.pencapaianPersen}
          status={data.gabungan.nominal.status}
          extra={`Sisa: ${formatJutaRupiah(data.gabungan.nominal.sisaAnggaran)}`}
          sisaNegatif={data.gabungan.nominal.sisaAnggaran < 0}
        />
        <KPICard
          title="Rasio Beban"
          subtitle="Rasio Beban terhadap Premi"
          value={formatPersen(data.gabungan.rasio.rasioRealisasi)}
          detail={`Target: ${formatPersen(data.gabungan.rasio.rasioTarget)}`}
          persen={data.gabungan.rasio.pencapaianRasio}
          status={data.gabungan.rasio.status}
        />
        <KPICard
          title="Pertumbuhan YoY"
          subtitle="Perbandingan dengan tahun lalu"
          value={formatPersen(data.gabungan.yoy.pertumbuhanPersen)}
          detail={`Tahun ini: ${formatJutaRupiah(data.gabungan.yoy.realisasiTahunIni)} vs ${formatJutaRupiah(data.gabungan.yoy.realisasiTahunLalu)}`}
          persen={data.gabungan.yoy.pertumbuhanPersen !== null && data.gabungan.yoy.pertumbuhanPersen > 0 ? 100 + data.gabungan.yoy.pertumbuhanPersen : 0}
          status={data.gabungan.yoy.status}
        />
      </div>

      {/* Proyeksi */}
      {data.proyeksiGabungan && (
        <Card title="Proyeksi Bulan Berjalan" className="mb-6">
          <ProyeksiTable
            proyeksiNonKur={data.proyeksiNonKur!}
            proyeksiKur={data.proyeksiKur!}
            proyeksiGabungan={data.proyeksiGabungan}
          />
        </Card>
      )}

      {/* Tabel Nominal */}
      <Card title="Tabel Nominal" subtitle="Realisasi Beban vs Target YTD" className="mb-6">
        <TabelNominal data={data} />
      </Card>

      {/* Tabel Rasio */}
      <Card title={`Tabel Rasio — ${NAMA_BULAN[bulanAktif]}`} subtitle="Rasio Beban Pemasaran terhadap Premi" className="mb-6">
        <TabelRasio data={data} />
      </Card>

      {/* Tabel YoY */}
      <Card title="Tabel Year-on-Year" subtitle="Perbandingan Realisasi Beban per Bulan" className="mb-6">
        <TabelYoY />
      </Card>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Realisasi Beban vs Target">
          <GrafikBebanVsTarget />
        </Card>
        <Card title="Tren Rasio Beban per Bulan">
          <GrafikRasioTren />
        </Card>
        <Card title="Perbandingan YoY per Bulan">
          <GrafikYoY />
        </Card>
        <Card title="Beban Kumulatif YTD vs Target">
          <GrafikKumulatifYTD />
        </Card>
      </div>
    </div>
  )
}

function KPICard({
  title, subtitle, value, detail, persen, status, extra, sisaNegatif,
}: {
  title: string; subtitle: string; value: string; detail: string;
  persen: number | null; status: StatusRAG; extra?: string; sisaNegatif?: boolean;
}) {
  return (
    <div className={clsx(
      'rounded-lg border p-5',
      status === 'aman' && 'bg-green-50 border-green-200',
      status === 'perhatian' && 'bg-yellow-50 border-yellow-200',
      status === 'bahaya' && 'bg-red-50 border-red-200',
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <StatusBadge status={status} />
      </div>
      <p className="text-xs text-slate-500 mb-1">{subtitle}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{detail}</p>
      {persen !== null && (
        <p className={clsx('text-sm font-semibold mt-1', {
          'text-green-700': status === 'aman',
          'text-yellow-700': status === 'perhatian',
          'text-red-700': status === 'bahaya',
        })}>
          Pencapaian: {formatPersen(persen)}
        </p>
      )}
      {extra && (
        <p className={clsx('text-xs font-medium mt-1', sisaNegatif ? 'text-red-600' : 'text-slate-600')}>
          {extra}
        </p>
      )}
    </div>
  )
}

function ProyeksiTable({ proyeksiNonKur, proyeksiKur, proyeksiGabungan }: {
  proyeksiNonKur: import('../engine/types').HasilProyeksi;
  proyeksiKur: import('../engine/types').HasilProyeksi;
  proyeksiGabungan: import('../engine/types').HasilProyeksi;
}) {
  const rows = [
    { label: 'Non KUR', data: proyeksiNonKur },
    { label: 'KUR', data: proyeksiKur },
    { label: 'Gabungan', data: proyeksiGabungan },
  ]
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th className="text-left py-2 px-2">Segmen</th>
            <th className="text-right py-2 px-2">Real YTD Sblm</th>
            <th className="text-right py-2 px-2">Real 1-15</th>
            <th className="text-right py-2 px-2">Potensi 16-31</th>
            <th className="text-right py-2 px-2">Asumsi YTD</th>
            <th className="text-right py-2 px-2">Target YTD</th>
            <th className="text-right py-2 px-2">% YTD</th>
            <th className="text-right py-2 px-2">Sisa</th>
            <th className="text-center py-2 px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-slate-100">
              <td className="py-2 px-2 font-medium">{r.label}</td>
              <td className="py-2 px-2 text-right">{formatAngka(r.data.realYTDSebelumnya)}</td>
              <td className="py-2 px-2 text-right">{formatAngka(r.data.realParuh1)}</td>
              <td className="py-2 px-2 text-right">{formatAngka(r.data.potensiParuh2)}</td>
              <td className="py-2 px-2 text-right font-medium">{formatAngka(r.data.asumsiYTD)}</td>
              <td className="py-2 px-2 text-right">{formatAngka(r.data.targetYTDBerjalan)}</td>
              <td className="py-2 px-2 text-right">{formatPersen(r.data.pencapaianProyeksi)}</td>
              <td className={clsx('py-2 px-2 text-right font-medium', r.data.sisaAnggaran < 0 ? 'text-red-600' : 'text-green-600')}>
                {formatAngka(r.data.sisaAnggaran)}
              </td>
              <td className="py-2 px-2 text-center"><StatusBadge status={r.data.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TabelNominal({ data }: { data: ReturnType<typeof useBPRData> }) {
  const rkap = useProfilStore((s) => getRKAPAktif(s))
  const rows: { label: string; nominal: HasilNominal; rkapVal: number }[] = [
    { label: 'Gabungan', nominal: data.gabungan.nominal, rkapVal: rkap.gabungan },
    { label: 'Non KUR', nominal: data.nonKur.nominal, rkapVal: rkap.nonKur },
    { label: 'KUR', nominal: data.kur.nominal, rkapVal: rkap.kur },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th className="text-left py-2 px-2">Keterangan</th>
            <th className="text-right py-2 px-2">Realisasi YTD</th>
            <th className="text-right py-2 px-2">Target YTD</th>
            <th className="text-right py-2 px-2">% YTD</th>
            <th className="text-right py-2 px-2">RKAP</th>
            <th className="text-right py-2 px-2">% RKAP</th>
            <th className="text-right py-2 px-2">Sisa Anggaran</th>
            <th className="text-center py-2 px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className={clsx('border-b border-slate-100', r.label === 'Gabungan' && 'bg-slate-50 font-medium')}>
              <td className="py-2 px-2">{r.label}</td>
              <td className="py-2 px-2 text-right">{formatAngka(r.nominal.realisasiYTD)}</td>
              <td className="py-2 px-2 text-right">{formatAngka(r.nominal.targetYTD)}</td>
              <td className="py-2 px-2 text-right">{formatPersen(r.nominal.pencapaianPersen)}</td>
              <td className="py-2 px-2 text-right">{formatAngka(r.rkapVal)}</td>
              <td className="py-2 px-2 text-right">{formatPersen(r.nominal.pencapaianRKAP)}</td>
              <td className={clsx('py-2 px-2 text-right font-medium', r.nominal.sisaAnggaran < 0 ? 'text-red-600' : 'text-green-600')}>
                {formatAngka(r.nominal.sisaAnggaran)}
              </td>
              <td className="py-2 px-2 text-center"><StatusBadge status={r.nominal.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TabelRasio({ data }: { data: ReturnType<typeof useBPRData> }) {
  const bulanAktif = useAppStore((s) => s.bulanAktif)
  const targetBeban = useProfilStore((s) => s.targetBebanYTD)
  const targetPremi = useProfilStore((s) => s.targetPremiYTD)
  const realisasiBeban = useInputStore((s) => s.realisasiBeban)
  const realisasiPremi = useInputStore((s) => s.realisasiPremi)

  const detailRows = [
    {
      label: 'Non KUR',
      premiTarget: targetPremi.nonKur[bulanAktif],
      bebanTarget: targetBeban.nonKur[bulanAktif],
      premiReal: hitungRealisasiYTD(realisasiPremi.nonKur, bulanAktif),
      bebanReal: hitungRealisasiYTD(realisasiBeban.nonKur, bulanAktif),
      rasio: data.nonKur.rasio,
    },
    {
      label: 'KUR',
      premiTarget: targetPremi.kur[bulanAktif],
      bebanTarget: targetBeban.kur[bulanAktif],
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
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th className="text-left py-2 px-2" rowSpan={2}>Segmen</th>
            <th className="text-center py-2 px-2 border-b border-slate-200" colSpan={3}>Target</th>
            <th className="text-center py-2 px-2 border-b border-slate-200" colSpan={3}>Realisasi</th>
            <th className="text-center py-2 px-2" rowSpan={2}>% Pencapaian</th>
            <th className="text-center py-2 px-2" rowSpan={2}>Status</th>
          </tr>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th className="text-right py-1 px-2">Premi</th>
            <th className="text-right py-1 px-2">Beban</th>
            <th className="text-right py-1 px-2">Rasio</th>
            <th className="text-right py-1 px-2">Premi</th>
            <th className="text-right py-1 px-2">Beban</th>
            <th className="text-right py-1 px-2">Rasio</th>
          </tr>
        </thead>
        <tbody>
          {detailRows.map((r) => (
            <tr key={r.label} className={clsx('border-b border-slate-100', r.label === 'Gabungan' && 'bg-slate-50 font-medium')}>
              <td className="py-2 px-2">{r.label}</td>
              <td className="py-2 px-2 text-right">{formatAngka(r.premiTarget)}</td>
              <td className="py-2 px-2 text-right">{formatAngka(r.bebanTarget)}</td>
              <td className="py-2 px-2 text-right">{formatPersen(r.rasio.rasioTarget)}</td>
              <td className="py-2 px-2 text-right">{formatAngka(r.premiReal)}</td>
              <td className="py-2 px-2 text-right">{formatAngka(r.bebanReal)}</td>
              <td className="py-2 px-2 text-right">{formatPersen(r.rasio.rasioRealisasi)}</td>
              <td className="py-2 px-2 text-right font-medium">{formatPersen(r.rasio.pencapaianRasio)}</td>
              <td className="py-2 px-2 text-center"><StatusBadge status={r.rasio.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TabelYoY() {
  const realisasiBeban = useInputStore((s) => s.realisasiBeban)
  const realisasiTahunLalu = useInputStore((s) => s.realisasiBebanTahunLalu)
  const tahunBerjalan = useProfilStore((s) => s.profil.tahunBerjalan)
  const tahunSebelumnya = useProfilStore((s) => s.profil.tahunSebelumnya)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th className="text-left py-2 px-2">Bulan</th>
            <th className="text-right py-2 px-2">Real {tahunSebelumnya}</th>
            <th className="text-right py-2 px-2">Real {tahunBerjalan}</th>
            <th className="text-right py-2 px-2">Selisih</th>
            <th className="text-right py-2 px-2">% Pertumbuhan</th>
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
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2 px-2">{bulan}</td>
                <td className="py-2 px-2 text-right">{hasData ? formatAngka(lalu) : '—'}</td>
                <td className="py-2 px-2 text-right">{hasData ? formatAngka(ini) : '—'}</td>
                <td className={clsx('py-2 px-2 text-right', selisih > 0 ? 'text-red-600' : selisih < 0 ? 'text-green-600' : '')}>
                  {hasData ? formatAngka(selisih) : '—'}
                </td>
                <td className={clsx('py-2 px-2 text-right font-medium', persen !== null && persen > 0 ? 'text-red-600' : 'text-green-600')}>
                  {persen !== null ? formatPersen(persen) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
