import { useState } from 'react'
import { AppWindow, ArrowDownRight, BookOpenText, Download, GitBranch, Home, Layers3, LayoutGrid } from 'lucide-react'
import { Dock, type DockItemData } from './Dock'
import { ToolDirectory } from './ToolDirectory'

const dockItems: DockItemData[] = [
  { label: '首页', href: '#top', icon: <Home /> },
  { label: '作品', href: '#works', icon: <LayoutGrid /> },
  { label: '交互台', href: '#studio', icon: <AppWindow /> },
  { label: '使用说明', href: '#guide', icon: <BookOpenText /> },
  { label: '下载', href: '#downloads', icon: <Download /> },
]

export function ExhibitionHeader() {
  const [directoryOpen, setDirectoryOpen] = useState(false)

  return (
    <header className="exhibition-header">
      <div className="header-left-cluster">
        <a className="exhibition-brand" href="#top" aria-label="CK Maya Lab 首页">
          <span><Layers3 /></span>
          <strong>CK MAYA LAB</strong>
        </a>
        <ToolDirectory open={directoryOpen} onOpenChange={setDirectoryOpen} />
      </div>
      <Dock items={dockItems} />
      <a className="exhibition-github" href="https://github.com/ckkl13/ck-maya-lab" target="_blank" rel="noreferrer">
        <GitBranch /><span>GitHub</span><ArrowDownRight />
      </a>
    </header>
  )
}
