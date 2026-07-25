import { GitBranch, Layers3 } from 'lucide-react'
import './App.css'
import { DownloadsSection } from './components/DownloadsSection'
import { ToolStudio } from './components/ToolStudio'
import { WorkflowSection } from './components/WorkflowSection'

export default function App() {
  return <><header className="site-header"><a className="site-brand" href="#studio"><span><Layers3 /></span><strong>CK MAYA LAB</strong></a><nav><a href="#studio">工具体验</a><a href="#workflow">使用流程</a><a href="#downloads">下载</a></nav><a className="github-link" href="https://github.com/ckkl13/ck-maya-lab" target="_blank" rel="noreferrer"><GitBranch /><span>GitHub</span></a></header><main><ToolStudio /><WorkflowSection /><DownloadsSection /></main><footer><span>CK MAYA LAB</span><p>面向绑定师和动画师的 Maya 工具展示与交互文档。</p><a href="#studio">返回工作台</a></footer></>
}
