import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useInputStore } from '../../store/inputStore'
import { useProfilStore } from '../../store/profilStore'
import { NAMA_BULAN } from '../../engine/types'
import { hitungRealisasiYTD } from '../../engine/nominal'
import { formatAngka } from '../../lib/formatAngka'

export function GrafikRasioTren() {
  const realisasiBeban = useInputStore((s) => s.realisasiBeban)
  const realisasiPremi = useInputStore((s) => s.realisasiPremi)
  const targetBeban = useProfilStore((s) => s.targetBebanYTD)
  const targetPremi = useProfilStore((s) => s.targetPremiYTD)

  const chartData = useMemo(() => {
    return NAMA_BULAN.map((bulan, i) => {
      const bebanNK = hitungRealisasiYTD(realisasiBeban.nonKur, i)
      const premiNK = hitungRealisasiYTD(realisasiPremi.nonKur, i)
      const bebanK = hitungRealisasiYTD(realisasiBeban.kur, i)
      const premiK = hitungRealisasiYTD(realisasiPremi.kur, i)

      const hasData = realisasiBeban.nonKur[i] !== null || realisasiBeban.kur[i] !== null

      return {
        bulan: bulan.substring(0, 3),
        'Non KUR': hasData && premiNK > 0 ? Math.round((bebanNK / premiNK) * 10000) / 100 : null,
        'KUR': hasData && premiK > 0 ? Math.round((bebanK / premiK) * 10000) / 100 : null,
        'Gabungan': hasData && (premiNK + premiK) > 0
          ? Math.round(((bebanNK + bebanK) / (premiNK + premiK)) * 10000) / 100
          : null,
      }
    })
  }, [realisasiBeban, realisasiPremi, targetBeban, targetPremi])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${formatAngka(v)}%`} />
        <Tooltip formatter={(value) => [`${formatAngka(value as number)}%`, undefined]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Non KUR" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line type="monotone" dataKey="KUR" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line type="monotone" dataKey="Gabungan" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  )
}
