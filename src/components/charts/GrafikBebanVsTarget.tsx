import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useInputStore } from '../../store/inputStore'
import { useProfilStore } from '../../store/profilStore'
import { NAMA_BULAN } from '../../engine/types'
import { formatAngka } from '../../lib/formatAngka'

export function GrafikBebanVsTarget() {
  const realisasiBeban = useInputStore((s) => s.realisasiBeban)
  const targetBeban = useProfilStore((s) => s.targetBebanYTD)

  const chartData = useMemo(() => {
    return NAMA_BULAN.map((bulan, i) => {
      const realNK = realisasiBeban.nonKur[i] ?? 0
      const realK = realisasiBeban.kur[i] ?? 0
      const tgtNK = targetBeban.nonKur[i]
      const tgtK = targetBeban.kur[i]
      const hasData = realisasiBeban.nonKur[i] !== null || realisasiBeban.kur[i] !== null

      return {
        bulan: bulan.substring(0, 3),
        Realisasi: hasData ? Math.round((realNK + realK) * 100) / 100 : 0,
        Target: tgtNK !== null || tgtK !== null ? Math.round(((tgtNK ?? 0) + (tgtK ?? 0)) * 100) / 100 : 0,
      }
    })
  }, [realisasiBeban, targetBeban])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatAngka(v)} />
        <Tooltip formatter={(value) => [`${formatAngka(value as number)} jt`, undefined]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Realisasi" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Target" fill="#cbd5e1" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
