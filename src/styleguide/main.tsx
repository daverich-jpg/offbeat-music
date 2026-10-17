import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../tokens/tokens.css'
import { Styleguide } from './Styleguide'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Styleguide />
  </StrictMode>,
)
