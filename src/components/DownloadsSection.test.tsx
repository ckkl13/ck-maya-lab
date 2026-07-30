import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DownloadsSection } from './DownloadsSection'

describe('DownloadsSection', () => {
  it('links readers to the standalone version archive', () => {
    const html = renderToStaticMarkup(<DownloadsSection />)

    expect(html).toContain('href="./history.html"')
    expect(html).toContain('下载历史版本')
  })
})
