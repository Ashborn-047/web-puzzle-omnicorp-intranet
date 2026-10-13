import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import NarrativeStudio from './ui/studio/NarrativeStudio.jsx'

createRoot(document.getElementById('studio-root')).render(
  <StrictMode>
    <NarrativeStudio isStandalone={true} />
  </StrictMode>,
)
