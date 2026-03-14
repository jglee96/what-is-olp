import { useEffect } from 'react'
import { initTheme } from '@shared/lib/theme'
import { SimulatorPage } from '@pages/simulator'

export function App() {
  useEffect(() => {
    initTheme()
  }, [])

  return <SimulatorPage />
}
