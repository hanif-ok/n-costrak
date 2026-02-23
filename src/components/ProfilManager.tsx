import { useState } from 'react'
import { Card } from './ui/Card'
import { useProfilManagerStore } from '../store/profilManagerStore'
import { useProfilStore } from '../store/profilStore'
import { useInputStore } from '../store/inputStore'
import { clsx } from 'clsx'

export function ProfilManager() {
  const daftarProfil = useProfilManagerStore((s) => s.daftarProfil)
  const profilAktifId = useProfilManagerStore((s) => s.profilAktifId)
  const simpanBaru = useProfilManagerStore((s) => s.simpanProfilBaru)
  const simpanSaatIni = useProfilManagerStore((s) => s.simpanProfilSaatIni)
  const muatProfil = useProfilManagerStore((s) => s.muatProfil)
  const hapusProfil = useProfilManagerStore((s) => s.hapusProfil)
  const renameProfil = useProfilManagerStore((s) => s.renameProfil)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')

  const handleRename = (id: string) => {
    if (editLabel.trim()) {
      renameProfil(id, editLabel.trim())
    }
    setEditingId(null)
    setEditLabel('')
  }

  const handleMulaiKosong = () => {
    // Save current profile first if active
    if (profilAktifId) {
      simpanSaatIni()
    }
    useProfilStore.getState().resetSemua()
    useInputStore.getState().resetSemua()
    useProfilManagerStore.setState({ profilAktifId: null })
  }

  return (
    <Card title="Profil Cabang" subtitle="Kelola beberapa profil cabang — data disimpan terpisah">
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => simpanBaru()}
            className="px-3 py-2 text-sm font-medium text-white bg-askrindo rounded-md hover:bg-askrindo-dark"
          >
            Simpan Profil Baru
          </button>
          {profilAktifId && (
            <button
              onClick={simpanSaatIni}
              className="px-3 py-2 text-sm font-medium text-askrindo bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
            >
              Simpan Perubahan
            </button>
          )}
          <button
            onClick={handleMulaiKosong}
            className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
          >
            Mulai Data Kosong
          </button>
        </div>

        {daftarProfil.length > 0 && (
          <div className="border border-slate-200 rounded-md divide-y divide-slate-200">
            {daftarProfil.map((p) => (
              <div
                key={p.id}
                className={clsx(
                  'px-4 py-3 flex items-center justify-between',
                  p.id === profilAktifId && 'bg-blue-50'
                )}
              >
                <div className="flex-1 min-w-0">
                  {editingId === p.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(p.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-askrindo-light"
                        autoFocus
                      />
                      <button onClick={() => handleRename(p.id)} className="text-xs text-askrindo font-medium">OK</button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {p.label}
                        {p.id === profilAktifId && (
                          <span className="ml-2 text-xs bg-askrindo text-white px-1.5 py-0.5 rounded-full">aktif</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.profil.wilayah || 'Tanpa wilayah'} — {p.profil.tahunBerjalan}
                        {' — diubah '}
                        {new Date(p.updatedAt).toLocaleDateString('id-ID')}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-3">
                  {p.id !== profilAktifId && (
                    <button
                      onClick={() => muatProfil(p.id)}
                      className="px-2 py-1 text-xs font-medium text-askrindo bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                    >
                      Muat
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingId(p.id); setEditLabel(p.label) }}
                    className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Ubah Nama
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus profil "${p.label}"?`)) hapusProfil(p.id)
                    }}
                    className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {daftarProfil.length === 0 && (
          <p className="text-sm text-slate-500">
            Belum ada profil tersimpan. Klik "Simpan Profil Baru" untuk menyimpan data saat ini.
          </p>
        )}
      </div>
    </Card>
  )
}
