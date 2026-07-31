import { useRef, type CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import {
  ArrowDownToLine,
  ArrowLeft,
  CalendarDays,
  HardDrive,
  PackageCheck,
} from 'lucide-react'
import { downloadHistory, formatFileSize } from '../data/downloadHistory'

export function DownloadHistoryPage() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
        timeline
          .from('.history-eyebrow, .history-title, .history-intro', {
            y: 26,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
          })
          .from(
            '.history-tool',
            {
              y: 34,
              opacity: 0,
              duration: 0.65,
              stagger: 0.1,
            },
            '-=0.35',
          )
      })

      return () => media.revert()
    },
    { scope },
  )

  return (
    <main ref={scope} className="history-page">
      <div className="history-ambient" aria-hidden="true" />
      <nav className="history-nav" aria-label="历史下载页导航">
        <a href="./">
          <ArrowLeft />
          返回工具展览
        </a>
        <span>MAYA TOOL ARCHIVE</span>
      </nav>

      <header className="history-hero">
        <p className="history-eyebrow">DOWNLOAD ARCHIVE / VERSION INDEX</p>
        <h1 className="history-title">历史版本<br />下载中心</h1>
        <p className="history-intro">
          三个工具分区独立维护。标记为“最新版”的文件与主站下载按钮保持一致，
          旧版用于项目复现与兼容性回退。
        </p>
      </header>

      <div className="history-tools">
        {downloadHistory.map((tool, toolIndex) => (
          <section
            className="history-tool"
            id={tool.id}
            key={tool.id}
            style={{ '--history-accent': tool.accent } as CSSProperties}
          >
            <header className="history-tool-header">
              <span>0{toolIndex + 1}</span>
              <div>
                <p>{tool.category}</p>
                <h2>{tool.name}</h2>
              </div>
              <div className="history-compatibility">
                <span>{tool.mayaVersions}</span>
                <span>{tool.platforms}</span>
              </div>
            </header>

            <div className="history-release-list">
              {tool.releases.map((release) => (
                <article
                  className={`history-release${release.isLatest ? ' is-latest' : ''}`}
                  key={`${tool.id}-${release.version}`}
                >
                  <div className="history-release-version">
                    <span>{release.isLatest ? '最新版' : '历史归档'}</span>
                    <h3>v{release.version}</h3>
                  </div>
                  <p>{release.note}</p>
                  <dl>
                    <div>
                      <dt><CalendarDays />发布日期</dt>
                      <dd>{release.date}</dd>
                    </div>
                    <div>
                      <dt><HardDrive />文件大小</dt>
                      <dd>{formatFileSize(release.sizeBytes)}</dd>
                    </div>
                  </dl>
                  <a href={release.downloadUrl} download>
                    <ArrowDownToLine />
                    下载 ZIP
                  </a>
                </article>
              ))}
              {tool.releases.every((release) => release.isLatest) && (
                <div className="history-empty-state">
                  <span>ARCHIVE EMPTY</span>
                  <p>当前暂无历史归档</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <footer className="history-footer">
        <PackageCheck />
        <p>安装前请先备份项目文件；历史版本不会覆盖“最新版”入口。</p>
        <a href="./#downloads">返回最新下载</a>
      </footer>
    </main>
  )
}

