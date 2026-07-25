import { ArrowUpRight, Download, GitBranch } from 'lucide-react'
import { tools } from '../data/tools'

export function DownloadsSection() {
  return (
    <section className="downloads-section" id="downloads">
      <div className="download-field" aria-hidden="true" />
      <header className="downloads-header">
        <span>FINAL ROOM / DOWNLOAD ARCHIVE</span>
        <h2>带走你的下一件 Maya 工具</h2>
        <p>所有下载均为静态 ZIP 包。网页不会连接 Maya，也不会执行任何 Python 或 MEL。</p>
      </header>
      <div className="download-list">
        {tools.map((tool, index) => (
          <article className="download-row" key={tool.id}>
            <span>0{index + 1}</span>
            <div className="download-main"><small>{tool.category} · v{tool.version}</small><h3>{tool.name}</h3></div>
            <p>{tool.mayaVersions} · {tool.platforms}<br />{tool.features.join(' · ')}</p>
            <a href={tool.downloadFile} download><Download />下载 ZIP</a>
          </article>
        ))}
      </div>
      <footer className="exhibition-footer">
        <div><strong>CK MAYA LAB</strong><span>Last update · 2026.07.25</span></div>
        <p>面向绑定师和动画师的 Maya 工具展览与交互文档。</p>
        <nav>
          <a href="./docs/TOOLS_USAGE.md">使用手册<ArrowUpRight /></a>
          <a href="https://github.com/ckkl13/ck-maya-lab/releases" target="_blank" rel="noreferrer"><GitBranch />GitHub Releases</a>
        </nav>
      </footer>
    </section>
  )
}
