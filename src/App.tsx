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
      <ExhibitionHeader />
      <main className="app-main">
        <SceneTransitions />
        <HeroExhibition />
        <ToolExhibition />
        <ToolStudio />
        <ToolUsageGuides />
        <DownloadsSection />
        <GradualBlur
          position="bottom"
          target="page"
          height="18rem"
          strength={6}
          divCount={16}
          curve="bezier"
          opacity={1}
        />
      </main>
    </>
  )
}
