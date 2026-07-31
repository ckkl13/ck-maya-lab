import { describe, expect, it } from 'vitest'
import { downloadHistory, formatFileSize, getLatestRelease } from './downloadHistory'

describe('download history data', () => {
  it('keeps one section for each Maya tool', () => {
    expect(downloadHistory.map((tool) => tool.id)).toEqual([
      'ck-rig-box',
      'ck-tool',
      'scripts-box',
    ])
  })

  it('keeps only the current release while no archive is retained', () => {
    for (const tool of downloadHistory) {
      expect(tool.releases).toHaveLength(1)
      expect(tool.releases[0].isLatest).toBe(true)
      expect(getLatestRelease(tool.id).isLatest).toBe(true)
    }
  })

  it('points latest entries at the current GitHub release assets', () => {
    expect(getLatestRelease('ck-rig-box').downloadUrl).toMatch(/\/ck_rig_Box\.zip$/)
    expect(getLatestRelease('ck-rig-box').sizeBytes).toBe(32_824)
    expect(getLatestRelease('ck-tool').sizeBytes).toBe(16_668_009)
    expect(getLatestRelease('scripts-box').downloadUrl).toMatch(/\/scripts\.box\.zip$/)
    expect(getLatestRelease('scripts-box').sizeBytes).toBe(232_251)
  })

  it('formats archive sizes for readers', () => {
    expect(formatFileSize(34_187)).toBe('33.4 KB')
    expect(formatFileSize(16_674_526)).toBe('15.9 MB')
    expect(formatFileSize(99_871_835)).toBe('95.2 MB')
  })
})
