import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const repositoryRoot = resolve(import.meta.dirname, '..')

const asset = (name, createdAt, size = 1024) => ({
  name,
  size,
  created_at: createdAt,
  browser_download_url: `https://example.test/${createdAt}/${name}`,
})

const completeRelease = (tagName, createdAt) => ({
  tag_name: tagName,
  draft: false,
  prerelease: false,
  assets: [
    asset('ck_rig_Box.zip', createdAt, 32_824),
    asset('ck-tool.zip', createdAt, 16_668_009),
    asset('scripts.box.zip', createdAt, 232_251),
  ],
})

test('generates latest and recursive history entries from complete releases', () => {
  const tempDirectory = mkdtempSync(resolve(tmpdir(), 'ck-release-history-'))
  const inputPath = resolve(tempDirectory, 'releases.json')
  const outputPath = resolve(tempDirectory, 'download-history.json')

  try {
    writeFileSync(
      inputPath,
      JSON.stringify([
        completeRelease('maya-tools-2026.08.12-2', '2026-08-12T10:30:00Z'),
        completeRelease('maya-tools-2026.08.12', '2026-08-12T02:00:00Z'),
        completeRelease('maya-tools-2026.07', '2026-07-31T04:06:50Z'),
        {
          tag_name: 'incomplete-release',
          draft: false,
          prerelease: false,
          assets: [asset('ck-tool.zip', '2026-06-01T00:00:00Z')],
        },
      ]),
    )

    const result = spawnSync(
      process.execPath,
      [
        resolve(repositoryRoot, 'scripts/generate-download-history.mjs'),
        '--input',
        inputPath,
        '--output',
        outputPath,
      ],
      { encoding: 'utf8' },
    )

    assert.equal(result.status, 0, result.stderr)

    const manifest = JSON.parse(readFileSync(outputPath, 'utf8'))
    const rigReleases = manifest.tools['ck-rig-box']

    assert.equal(rigReleases.length, 3)
    assert.deepEqual(
      rigReleases.map(({ version, date, isLatest }) => ({ version, date, isLatest })),
      [
        { version: '2026.08.12.2', date: '2026-08-12', isLatest: true },
        { version: '2026.08.12', date: '2026-08-12', isLatest: false },
        { version: '2026.07.31', date: '2026-07-31', isLatest: false },
      ],
    )
    assert.match(rigReleases[0].downloadUrl, /ck_rig_Box\.zip$/)
    assert.equal(manifest.tools['ck-tool'][0].sizeBytes, 16_668_009)
    assert.equal(manifest.tools['scripts-box'][0].sizeBytes, 232_251)
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true })
  }
})

test('the Pages workflow refreshes history when a Release changes', () => {
  const workflow = readFileSync(
    resolve(repositoryRoot, '.github/workflows/deploy-pages.yml'),
    'utf8',
  )

  assert.match(workflow, /release:\s*\n\s+types:\s*\[published,\s*edited,\s*deleted\]/)
  assert.match(workflow, /node scripts\/generate-download-history\.mjs/)
  assert.match(workflow, /git add src\/data\/downloadHistory\.generated\.json/)
})

test('rejects a newly published release when a required ZIP is missing', () => {
  const tempDirectory = mkdtempSync(resolve(tmpdir(), 'ck-release-history-invalid-'))
  const inputPath = resolve(tempDirectory, 'releases.json')
  const outputPath = resolve(tempDirectory, 'download-history.json')

  try {
    writeFileSync(
      inputPath,
      JSON.stringify([
        completeRelease('previous-complete', '2026-07-31T04:06:50Z'),
        {
          tag_name: 'missing-scripts-box',
          draft: false,
          prerelease: false,
          assets: [
            asset('ck_rig_Box.zip', '2026-08-12T10:30:00Z'),
            asset('ck-tool.zip', '2026-08-12T10:30:00Z'),
          ],
        },
      ]),
    )

    const result = spawnSync(
      process.execPath,
      [
        resolve(repositoryRoot, 'scripts/generate-download-history.mjs'),
        '--input',
        inputPath,
        '--output',
        outputPath,
        '--require-tag',
        'missing-scripts-box',
      ],
      { encoding: 'utf8' },
    )

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /scripts\.box\.zip/)
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true })
  }
})
