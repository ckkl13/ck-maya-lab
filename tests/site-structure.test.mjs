import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('app composes the five-scene exhibition narrative', async () => {
  const app = await read('src/App.tsx')
  for (const component of ['HeroExhibition', 'ToolExhibition', 'ToolStudio', 'ToolUsageGuides', 'DownloadsSection']) {
    assert.match(app, new RegExp(`<${component}`))
  }
})

test('the exhibition includes all three tools and honest simulation boundaries', async () => {
  const exhibition = await read('src/components/ToolExhibition.tsx')
  assert.match(exhibition, /tools\.map/)
  assert.match(exhibition, /CK Tool、Scripts Box/)
  assert.match(exhibition, /不执行 Maya/)
})

test('work links select a tool and move the visitor to the studio', async () => {
  const exhibition = await read('src/components/ToolExhibition.tsx')
  assert.match(exhibition, /openInStudio/)
  assert.match(exhibition, /HashChangeEvent/)
  assert.match(exhibition, /getElementById\('studio'\).*scrollIntoView/s)
})

test('pointer interaction avoids React state updates', async () => {
  const hook = await read('src/hooks/usePointerField.ts')
  assert.match(hook, /requestAnimationFrame/)
  assert.doesNotMatch(hook, /useState/)
  assert.match(hook, /prefers-reduced-motion/)
})

test('the mobile hero headline fits within the narrow viewport', async () => {
  const css = await read('src/App.css')
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*?\.hero-copy h1 \{ font-size: 13vw;/)
})
