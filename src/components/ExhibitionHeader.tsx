import { ArrowDownRight, GitBranch, Layers3 } from 'lucide-react'

export function ExhibitionHeader() {
  return (
    <header className="exhibition-header">
      <a className="exhibition-brand" href="#top" aria-label="CK Maya Lab 首页">
        <span><Layers3 /></span>
        <strong>CK MAYA LAB</strong>
      </a>
      <nav aria-label="主导航">
        <a href="#works">作品</a>
        <a href="#studio">交互台</a>
        <a href="#guide">使用说明</a>
        <a href="#downloads">下载</a>
      </nav>
      <a className="exhibition-github" href="https://github.com/ckkl13/ck-maya-lab" target="_blank" rel="noreferrer">
        <GitBranch /><span>GitHub</span><ArrowDownRight />
      </a>
    </header>
  )
}
