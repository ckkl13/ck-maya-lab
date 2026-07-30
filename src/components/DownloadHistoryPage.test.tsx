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
})
