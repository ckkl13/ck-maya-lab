import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DownloadHistoryPage } from './DownloadHistoryPage'

describe('DownloadHistoryPage', () => {
  it('renders separate release regions for all three tools', () => {
    const html = renderToStaticMarkup(<DownloadHistoryPage />)

    expect(html).toContain('CK Rig Box')
    expect(html).toContain('CK Tool')
    expect(html).toContain('Scripts Box')
    expect(html.match(/history-release is-latest/g)).toHaveLength(3)
  })

  it('provides a route back to the exhibition', () => {
    const html = renderToStaticMarkup(<DownloadHistoryPage />)

    expect(html).toContain('href="./"')
    expect(html).toContain('返回工具展览')
  })

  it('shows an empty archive state without removing the history interface', () => {
    const html = renderToStaticMarkup(<DownloadHistoryPage />)

    expect(html.match(/history-empty-state/g)).toHaveLength(3)
    expect(html.match(/当前暂无历史归档/g)).toHaveLength(3)
  })
})
