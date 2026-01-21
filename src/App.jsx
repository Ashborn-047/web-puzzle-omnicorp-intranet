import { GameStateProvider } from './core/gameState/GameStateContext'
import CorporatePortal from './CorporatePortal'
import './index.css'

function App() {
  return (
    <GameStateProvider>
      <CorporatePortal />
    </GameStateProvider>
  )
}

export default App
