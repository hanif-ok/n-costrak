import { useAppStore } from './store/appStore'
import { useSimulasiStore } from './store/simulasiStore'
import { Sidebar } from './components/layout/Sidebar'
import { PrintLayout } from './components/PrintLayout'
import { DasborPage } from './pages/DasborPage'
import { InputPage } from './pages/InputPage'
import { SimulasiPage } from './pages/SimulasiPage'
import { DataPage } from './pages/DataPage'

function App() {
  const tabAktif = useAppStore((s) => s.tabAktif)
  const simulasiAktif = useSimulasiStore((s) => s.aktif)

  return (
    <div className="flex min-h-screen bg-slate-50">
      {simulasiAktif && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 font-bold text-sm tracking-wide">
          MODE SIMULASI — Data yang ditampilkan adalah hasil simulasi, bukan data aktual
        </div>
      )}
      <Sidebar />
      <main className={`flex-1 ml-64 ${simulasiAktif ? 'mt-10' : ''}`}>
        <div className="p-6 max-w-7xl mx-auto">
          {tabAktif === 'dasbor' && <DasborPage />}
          {tabAktif === 'input' && <InputPage />}
          {tabAktif === 'simulasi' && <SimulasiPage />}
          {tabAktif === 'data' && <DataPage />}
        </div>
      </main>
      <PrintLayout />
    </div>
  )
}

export default App
