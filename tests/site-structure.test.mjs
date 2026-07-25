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

test('all tools share the approved compatibility copy', async () => {
  const tools = await read('src/data/tools.ts')
  const types = await read('src/types/tools.ts')
  assert.equal([...tools.matchAll(/mayaVersions: 'Maya 2022\+'/g)].length, 3)
  assert.equal([...tools.matchAll(/platforms: 'Windows\.Mac'/g)].length, 3)
  assert.match(types, /platforms: string/)
})

test('the studio does not render CK Tool sidebar artwork', async () => {
  const studio = await read('src/components/ToolStudio.tsx')
  assert.doesNotMatch(studio, /activeTool\.screenshot/)
})

test('CK Tool uses the supplied Siri GIF in the existing orb control', async () => {
  const ckTool = await read('src/demos/CkToolDemo.tsx')
  assert.match(ckTool, /ck-tool-siri\.gif/)
  assert.match(ckTool, /className="ck-siri-image"/)
})

test('the usage guide uses a dark exhibition surface', async () => {
  const css = await read('src/App.css')
  assert.match(css, /\.usage-guides \{[^}]*background: #0b0d0f;/)
  assert.match(css, /\.guide-workspace \{[^}]*background: #15191c;/)
  assert.match(css, /\.guide-chapter-panel \{[^}]*background: #121619;/)
})
