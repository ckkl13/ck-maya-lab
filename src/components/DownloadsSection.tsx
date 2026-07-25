import { Download, FileArchive, GitBranch, MonitorCheck } from 'lucide-react'
import { tools } from '../data/tools'
import { SpotlightPanel } from './SpotlightPanel'

export function DownloadsSection() {
  return <section className="downloads-section" id="downloads"><div className="downloads-header"><div><h2>工具下载</h2><p>下载包由当前正式源码生成，并排除备份、缓存、虚拟环境和 Graphify 分析产物。</p></div><a href="https://github.com/ckkl13/ck-maya-lab/releases" target="_blank" rel="noreferrer"><GitBranch />GitHub Releases</a></div><div className="download-list">{tools.map((tool) => <SpotlightPanel key={tool.id} className="download-row" color={`${tool.accent}18`}><div className="download-icon" style={{ color: tool.accent }}><FileArchive /></div><div className="download-main"><span>{tool.category}</span><h3>{tool.name}</h3><p>{tool.features.join(' · ')}</p></div><div className="download-meta"><span><MonitorCheck />{tool.mayaVersions}</span><span>v{tool.version}</span></div><a href={tool.downloadFile} download><Download />下载 ZIP</a></SpotlightPanel>)}</div><p className="download-note">Scripts Box 中的内置脚本在公开发布前仍需完成来源与许可证确认。网页演示不会执行任何 Python 或 MEL 文本。</p></section>
}
