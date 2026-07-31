import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('Vite builds the standalone history page', () => {
  const viteConfig = read('vite.config.ts')

  assert.match(viteConfig, /history:\s*resolve\(__dirname,\s*'history\.html'\)/)
})

test('the latest download section links to the history page', () => {
  const downloads = read('src/components/DownloadsSection.tsx')

  assert.match(downloads, /href="\.\/history\.html"/)
  assert.match(downloads, /下载历史版本/)
})

test('the primary tool downloads follow the generated latest releases', () => {
  const tools = read('src/data/tools.ts')

  assert.match(tools, /getLatestRelease\('ck-rig-box'\)\.downloadUrl/)
  assert.match(tools, /getLatestRelease\('ck-tool'\)\.downloadUrl/)
  assert.match(tools, /getLatestRelease\('scripts-box'\)\.downloadUrl/)
})
