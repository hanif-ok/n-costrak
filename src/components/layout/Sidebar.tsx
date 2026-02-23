import { useAppStore, type TabAktif } from '../../store/appStore'
import { useProfilStore } from '../../store/profilStore'
import { useProfilManagerStore } from '../../store/profilManagerStore'
import { clsx } from 'clsx'

const menuItems: { id: TabAktif; label: string; icon: string }[] = [
  { id: 'dasbor', label: 'Dasbor', icon: '📊' },
  { id: 'input', label: 'Input Data', icon: '📝' },
  { id: 'simulasi', label: 'Simulasi', icon: '🔮' },
  { id: 'data', label: 'Kelola Data', icon: '💾' },
]

export function Sidebar() {
  const tabAktif = useAppStore((s) => s.tabAktif)
  const setTabAktif = useAppStore((s) => s.setTabAktif)
  const namaCabang = useProfilStore((s) => s.profil.nama)
  const tahun = useProfilStore((s) => s.profil.tahunBerjalan)
  const daftarProfil = useProfilManagerStore((s) => s.daftarProfil)
  const profilAktifId = useProfilManagerStore((s) => s.profilAktifId)
  const muatProfil = useProfilManagerStore((s) => s.muatProfil)

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-askrindo-dark text-white flex flex-col no-print">
      <div className="p-5 border-b border-blue-800">
        <h1 className="text-lg font-bold leading-tight">PINTAR</h1>
        <p className="text-blue-300 text-xs mt-1">PT Asuransi Kredit Indonesia</p>
      </div>

      {namaCabang && (
        <div className="px-5 py-3 border-b border-blue-800 bg-blue-900/50">
          <p className="text-sm font-medium truncate">{namaCabang}</p>
          <p className="text-blue-300 text-xs">Tahun {tahun}</p>
        </div>
      )}

      {daftarProfil.length > 1 && (
        <div className="px-5 py-2 border-b border-blue-800">
          <select
            value={profilAktifId ?? ''}
            onChange={(e) => { if (e.target.value) muatProfil(e.target.value) }}
            className="w-full px-2 py-1.5 bg-blue-900 border border-blue-700 rounded text-xs text-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="" disabled>Pilih profil...</option>
            {daftarProfil.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
      )}

      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTabAktif(item.id)}
            className={clsx(
              'w-full text-left px-5 py-3 flex items-center gap-3 transition-colors text-sm',
              tabAktif === item.id
                ? 'bg-blue-700 text-white font-medium'
                : 'text-blue-200 hover:bg-blue-800 hover:text-white'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800 text-xs text-blue-400">
        <p>Versi 1.0</p>
        <p>Data tersimpan lokal</p>
      </div>
    </aside>
  )
}
