import './App.css'
import { DownloadsSection } from './components/DownloadsSection'
import { ExhibitionHeader } from './components/ExhibitionHeader'
import { HeroExhibition } from './components/HeroExhibition'
import { ToolExhibition } from './components/ToolExhibition'
import { ToolStudio } from './components/ToolStudio'
import { ToolUsageGuides } from './components/ToolUsageGuides'

export default function App() {
  return <><ExhibitionHeader /><main><HeroExhibition /><ToolExhibition /><ToolStudio /><ToolUsageGuides /><DownloadsSection /></main></>
}
