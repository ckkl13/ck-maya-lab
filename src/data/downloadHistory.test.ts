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

  it('keeps exactly one latest release at the start of each history', () => {
    for (const tool of downloadHistory) {
      expect(tool.releases.length).toBeGreaterThan(0)
      expect(tool.releases[0].isLatest).toBe(true)
      expect(tool.releases.filter((release) => release.isLatest)).toHaveLength(1)
      expect(getLatestRelease(tool.id).isLatest).toBe(true)
    }
  })

  it('points latest entries at the current GitHub release assets', () => {
    expect(getLatestRelease('ck-rig-box').downloadUrl).toMatch(/\/ck_rig_Box\.zip$/)
    expect(getLatestRelease('ck-tool').downloadUrl).toMatch(/\/ck-tool\.zip$/)
    expect(getLatestRelease('scripts-box').downloadUrl).toMatch(/\/scripts\.box\.zip$/)

    for (const tool of downloadHistory) {
      expect(getLatestRelease(tool.id).sizeBytes).toBeGreaterThan(0)
    }
  })

  it('uses upload-date versions for every generated release', () => {
    for (const tool of downloadHistory) {
      for (const release of tool.releases) {
        expect(release.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(release.version).toMatch(
          new RegExp(`^${release.date.replaceAll('-', '\\.')}(?:\\.\\d+)?$`),
        )
      }
    }
  })

  it('formats archive sizes for readers', () => {
    expect(formatFileSize(34_187)).toBe('33.4 KB')
    expect(formatFileSize(16_674_526)).toBe('15.9 MB')
    expect(formatFileSize(99_871_835)).toBe('95.2 MB')
  })
})
