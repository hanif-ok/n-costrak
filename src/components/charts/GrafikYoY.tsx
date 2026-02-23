import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useInputStore } from '../../store/inputStore'
import { useProfilStore } from '../../store/profilStore'
import { NAMA_BULAN } from '../../engine/types'
import { formatAngka } from '../../lib/formatAngka'

export function GrafikYoY() {
  const realisasiBeban = useInputStore((s) => s.realisasiBeban)
  const tahunLalu = useInputStore((s) => s.realisasiBebanTahunLalu)
  const tahunBerjalan = useProfilStore((s) => s.profil.tahunBerjalan)
  const tahunSebelumnya = useProfilStore((s) => s.profil.tahunSebelumnya)

  const chartData = useMemo(() => {
    return NAMA_BULAN.map((bulan, i) => {
      const lalu = (tahunLalu.nonKur[i] ?? 0) + (tahunLalu.kur[i] ?? 0)
      const ini = (realisasiBeban.nonKur[i] ?? 0) + (realisasiBeban.kur[i] ?? 0)

      return {
        bulan: bulan.substring(0, 3),
        [String(tahunSebelumnya)]: lalu || null,
        [String(tahunBerjalan)]: ini || null,
      }
    })
  }, [realisasiBeban, tahunLalu, tahunBerjalan, tahunSebelumnya])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatAngka(v)} />
        <Tooltip formatter={(value) => [`${formatAngka(value as number)} jt`, undefined]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey={String(tahunSebelumnya)} fill="#94a3b8" radius={[2, 2, 0, 0]} />
        <Bar dataKey={String(tahunBerjalan)} fill="#3b82f6" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
