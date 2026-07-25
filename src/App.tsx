import './App.css'
import { DownloadsSection } from './components/DownloadsSection'
import { ExhibitionHeader } from './components/ExhibitionHeader'
import { GradualBlur } from './components/GradualBlur'
import { GlobalInteractiveBackground } from './components/GlobalInteractiveBackground'
import { HeroExhibition } from './components/HeroExhibition'
import { SceneTransitions } from './components/SceneTransitions'
import { ToolExhibition } from './components/ToolExhibition'
import { ToolStudio } from './components/ToolStudio'
import { ToolUsageGuides } from './components/ToolUsageGuides'

export default function App() {
  return (
    <>
      <GlobalInteractiveBackground />
      <GradualBlur
        position="bottom"
        height="9rem"
        strength={2.4}
        divCount={8}
        curve="bezier"
        exponential
        opacity={0.94}
      />
      <ExhibitionHeader />
      <main className="app-main">
        <SceneTransitions />
        <HeroExhibition />
        <ToolExhibition />
        <ToolStudio />
        <ToolUsageGuides />
        <DownloadsSection />
      </main>
    </>
  )
}
