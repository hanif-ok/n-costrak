import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useInputStore } from '../../store/inputStore'
import { useProfilStore } from '../../store/profilStore'
import { NAMA_BULAN } from '../../engine/types'
import { hitungRealisasiYTD } from '../../engine/nominal'
import { formatAngka } from '../../lib/formatAngka'

export function GrafikKumulatifYTD() {
  const realisasiBeban = useInputStore((s) => s.realisasiBeban)
  const targetBeban = useProfilStore((s) => s.targetBebanYTD)

  const chartData = useMemo(() => {
    return NAMA_BULAN.map((bulan, i) => {
      const realNK = hitungRealisasiYTD(realisasiBeban.nonKur, i)
      const realK = hitungRealisasiYTD(realisasiBeban.kur, i)
      const tgtNK = targetBeban.nonKur[i] ?? 0
      const tgtK = targetBeban.kur[i] ?? 0

      return {
        bulan: bulan.substring(0, 3),
        'Realisasi Kumulatif': Math.round((realNK + realK) * 100) / 100,
        'Target Kumulatif': Math.round((tgtNK + tgtK) * 100) / 100,
      }
    })
  }, [realisasiBeban, targetBeban])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatAngka(v)} />
        <Tooltip formatter={(value) => [`${formatAngka(value as number)} jt`, undefined]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="Target Kumulatif" fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />
        <Area type="monotone" dataKey="Realisasi Kumulatif" fill="#bfdbfe" stroke="#3b82f6" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
