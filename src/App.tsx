import { useRef } from 'react'
import './App.css'
import { DownloadsSection } from './components/DownloadsSection'
import { ExhibitionHeader } from './components/ExhibitionHeader'
import { GlobalInteractiveBackground } from './components/GlobalInteractiveBackground'
import { HeroExhibition } from './components/HeroExhibition'
import { SceneTransitions } from './components/SceneTransitions'
import { ToolExhibition } from './components/ToolExhibition'
import { ToolStudio } from './components/ToolStudio'
import { ToolUsageGuides } from './components/ToolUsageGuides'

export default function App() {
  const sceneScope = useRef<HTMLElement>(null)

  return (
    <>
      <GlobalInteractiveBackground />
      <ExhibitionHeader />
      <main ref={sceneScope} className="app-main">
        <SceneTransitions scope={sceneScope} />
        <HeroExhibition />
        <ToolExhibition />
        <ToolStudio />
        <ToolUsageGuides />
        <DownloadsSection />
      </main>
    </>
  )
}
