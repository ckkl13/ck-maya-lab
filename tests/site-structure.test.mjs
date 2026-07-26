import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
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

test('page interaction includes a restrained click pulse and proximity text treatment', async () => {
  const app = await read('src/App.tsx')
  const pulse = await read('src/components/PageClickPulse.tsx')
  const proximity = await read('src/components/VariableProximity.tsx')
  const proximityCss = await read('src/components/VariableProximity.css')
  const scrollFloat = await read('src/components/ScrollFloatText.tsx')
  assert.match(app, /<PageClickPulse/)
  assert.match(pulse, /pointerdown/)
  assert.match(proximity, /translateY/)
  assert.doesNotMatch(proximity, /letterSpacing/)
  assert.match(proximityCss, /font-family: inherit/)
  assert.doesNotMatch(proximityCss, /Roboto Flex/)
  assert.match(scrollFloat, /scrollTrigger/)
})

test('tool exhibition layers an editorial depth field behind its work journey', async () => {
  const exhibition = await read('src/components/ToolExhibition.tsx')
  const css = await read('src/App.css')
  assert.match(exhibition, /exhibition-depth/)
  assert.match(exhibition, /exhibition-current/)
  assert.match(exhibition, /<TiltedCard/)
  assert.match(exhibition, /work-tilt-card/)
  assert.match(exhibition, /scrub: 0\.9/)
  assert.match(css, /\.exhibition-depth/)
  assert.match(css, /\.work-visual::before/)
})

test('pointer light keeps following without resetting after leaving a scope', async () => {
  const hook = await read('src/hooks/usePointerField.ts')
  assert.match(hook, /currentX/)
  assert.match(hook, /targetX/)
  assert.match(hook, /currentX \+= \(targetX - currentX\)/)
  assert.doesNotMatch(hook, /pointerleave/)
  assert.doesNotMatch(hook, /const reset/)
  assert.match(hook, /document\.documentElement/)
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

test('app mounts one global interactive background and scene coordinator', async () => {
  const app = await read('src/App.tsx')
  assert.equal((app.match(/<GlobalInteractiveBackground/g) ?? []).length, 1)
  assert.equal((app.match(/<SceneTransitions/g) ?? []).length, 1)
})

test('all five primary sections expose stable scene markers', async () => {
  const files = [
    'src/components/HeroExhibition.tsx',
    'src/components/ToolExhibition.tsx',
    'src/components/ToolStudio.tsx',
    'src/components/ToolUsageGuides.tsx',
    'src/components/DownloadsSection.tsx',
  ]
  for (const file of files) {
    assert.match(await read(file), /data-scene=/)
  }
})

test('global background is decorative, non-blocking, and motion aware', async () => {
  const component = await read('src/components/GlobalInteractiveBackground.tsx')
  const css = await read('src/App.css')
  assert.match(component, /aria-hidden="true"/)
  assert.match(css, /\.global-interactive-background\s*\{[^}]*pointer-events:\s*none/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
})

test('global pointer interaction stays frame-batched and outside React state', async () => {
  const hook = await read('src/hooks/usePointerField.ts')
  assert.match(hook, /requestAnimationFrame/)
  assert.match(hook, /--global-pointer-x/)
  assert.match(hook, /--global-pointer-y/)
  assert.doesNotMatch(hook, /useState/)
})

test('scene indicator derives its initial value from the viewport center', async () => {
  const transitions = await read('src/components/SceneTransitions.tsx')
  assert.match(transitions, /getBoundingClientRect/)
  assert.match(transitions, /window\.innerHeight\s*\/\s*2/)
})

test('scene coordinator owns a mounted lifecycle scope', async () => {
  const transitions = await read('src/components/SceneTransitions.tsx')
  assert.match(transitions, /indicatorRef/)
  assert.match(transitions, /ref=\{indicatorRef\}/)
  assert.match(transitions, /querySelector<HTMLElement>\('\.app-main'\)/)
})

test('app mounts one fixed viewport-bottom GradualBlur', async () => {
  const app = await read('src/App.tsx')
  assert.equal((app.match(/<GradualBlur/g) ?? []).length, 1)
  assert.match(app, /position="bottom"/)
  assert.match(app, /target="page"/)
  assert.match(app, /height="18rem"/)
  assert.match(app, /divCount=\{8\}/)
  assert.match(app, /strength=\{6\}/)
  assert.match(app, /opacity=\{1\}/)
  assert.doesNotMatch(app, /exponential/)
})

test('scene transitions reverse into a visible upward exit', async () => {
  const transitions = await read('src/components/SceneTransitions.tsx')
  assert.match(transitions, /conditions\?\.motion && conditions\.desktop/)
  assert.match(transitions, /y: 96, rotation: 1\.1, autoAlpha: 0/)
  assert.match(transitions, /y: -96, rotation: -1\.1, autoAlpha: 0/)
  assert.match(transitions, /end: 'bottom 28%'/)
  assert.match(transitions, /scrub: 0\.65/)
})

test('scene changes do not render a scanning line over the background', async () => {
  const app = await read('src/App.tsx')
  const transitions = await read('src/components/SceneTransitions.tsx')
  const css = await read('src/App.css')
  assert.doesNotMatch(app, /global-scan-line/)
  assert.doesNotMatch(transitions, /scanLine/)
  assert.doesNotMatch(css, /\.global-scan-line/)
})

test('GradualBlur is decorative and has a browser fallback', async () => {
  const component = await read('src/components/GradualBlur.tsx')
  const css = await read('src/components/GradualBlur.css')
  assert.match(component, /aria-hidden="true"/)
  assert.match(css, /\.gradual-blur\s*\{[^}]*pointer-events:\s*none/)
  assert.match(css, /@supports not \(\(backdrop-filter:/)
})

test('GradualBlur reduces layers and height on narrow screens', async () => {
  const css = await read('src/components/GradualBlur.css')
  assert.match(css, /@media \(max-width: 760px\)/)
  assert.match(css, /--gradual-blur-height:\s*4\.5rem/)
  assert.match(css, /\.gradual-blur-layer:nth-child\(n\+5\)/)
})

test('GradualBlur adds no unused math dependency', async () => {
  const pkg = await read('package.json')
  assert.doesNotMatch(pkg, /mathjs/)
})

test('the exhibition header composes a Dock and a left tool directory', async () => {
  const header = await read('src/components/ExhibitionHeader.tsx')
  assert.match(header, /<Dock/)
  assert.match(header, /<ToolDirectory/)
  assert.match(header, /header-left-cluster/)
})

test('Dock uses Motion springs and respects reduced motion', async () => {
  const dock = await read('src/components/Dock.tsx')
  const pkg = await read('package.json')
  assert.match(dock, /motion\/react/)
  assert.match(dock, /useSpring/)
  assert.match(dock, /useReducedMotion/)
  assert.match(pkg, /"motion"/)
})

test('tool directory is data driven and opens from the left', async () => {
  const directory = await read('src/components/ToolDirectory.tsx')
  const menu = await read('src/components/StaggeredMenu.tsx')
  const catalog = await read('src/data/toolCatalog.ts')
  assert.match(directory, /groups=\{toolCatalog\}/)
  assert.match(directory, /activeGroup\.tools\.map/)
  assert.match(directory, /<LineSidebar/)
  assert.match(directory, /<StaggeredMenu/)
  assert.match(menu, /data-side="left"/)
  assert.match(catalog, /CK Rig Box/)
  assert.match(catalog, /CK Tool/)
  assert.match(catalog, /Scripts Box/)
})

test('tool directory exposes both studio and guide destinations', async () => {
  const directory = await read('src/components/ToolDirectory.tsx')
  const guides = await read('src/components/ToolUsageGuides.tsx')
  assert.match(directory, /tool-guide-select/)
  assert.match(directory, /交互台/)
  assert.match(directory, /使用说明/)
  assert.match(guides, /tool-guide-select/)
})

test('GradualBlur overlaps soft layers without excessive compositor memory', async () => {
  const component = await read('src/components/GradualBlur.tsx')
  assert.match(component, /Math\.min\(8/)
  assert.match(component, /centre - 24/)
  assert.match(component, /centre \+ 24/)
})

test('large page sections do not keep permanent compositor layers', async () => {
  const css = await read('src/App.css')
  const proximity = await read('src/components/VariableProximity.css')
  const card = await read('src/components/TiltedCard.css')
  assert.doesNotMatch(css, /\[data-scene\][^}]*will-change/)
  assert.doesNotMatch(proximity, /will-change/)
  assert.doesNotMatch(card, /will-change/)
})

test('tool directory matches the Dock interaction and links to tool showcases', async () => {
  const directory = await read('src/components/ToolDirectory.tsx')
  const exhibition = await read('src/components/ToolExhibition.tsx')
  assert.match(directory, /motion\.button/)
  assert.match(directory, /tool-directory-trigger-label/)
  assert.match(directory, /openShowcase/)
  assert.match(directory, /工具展示/)
  assert.match(exhibition, /id=\{`showcase-\$\{tool\.id\}`\}/)
  assert.match(exhibition, /查看效果/)
  assert.doesNotMatch(exhibition, /查看界面/)
})

test('primary page actions reuse the Dock hover language without styling every control', async () => {
  const css = await read('src/App.css')
  assert.match(css, /Dock-inspired feedback/)
  assert.match(css, /\.work-actions a::after/)
  assert.match(css, /\.download-row > a::after/)
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/)
})

test('tool directory animates both its close icon and drawer exit', async () => {
  const directory = await read('src/components/ToolDirectory.tsx')
  const menu = await read('src/components/StaggeredMenu.tsx')
  assert.match(directory, /AnimatePresence/)
  assert.match(directory, /tool-directory-trigger-icon/)
  assert.match(menu, /timeline\.current\?\.reverse\(\)/)
  assert.match(menu, /onReverseComplete/)
})

test('hero tool screenshots use TiltedCard focus without decorative frame gaps', async () => {
  const hero = await read('src/components/HeroExhibition.tsx')
  const card = await read('src/components/TiltedCard.tsx')
  const css = await read('src/App.css')
  assert.match(hero, /<TiltedCard/)
  assert.match(hero, /activeFrame/)
  assert.match(hero, /onActiveChange/)
  assert.match(card, /useMotionValue/)
  assert.match(card, /useSpring/)
  assert.match(card, /onPointerMove/)
  assert.match(card, /loading=\{imageLoading\}/)
  assert.match(card, /decoding="async"/)
  assert.match(hero, /imageLoading="eager"/)
  assert.match(css, /\.hero-frame\.is-active\s*\{[^}]*z-index:\s*10/)
  assert.match(css, /\.hero-frame img\s*\{[^}]*object-fit:\s*cover/)
  assert.match(css, /\.hero-frame-rig\s*\{[^}]*aspect-ratio:\s*390\s*\/\s*498/)
  assert.match(css, /\.hero-frame-ck\s*\{[^}]*aspect-ratio:\s*488\s*\/\s*1012/)
  assert.match(css, /\.hero-artwork-inner\s*\{[^}]*width:\s*min\(100%, 820px\)/)
  assert.match(css, /@media \(max-width: 820px\)[\s\S]*?\.hero-frame-rig \{ width: auto; height: 68%;/)
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*?\.hero-frame-rig \{ height: 64%;/)
  assert.doesNotMatch(css, /\.hero-frame\s*\{[^}]*border:/)
})

test('tool showcase cards keep the stable link-based image interaction', async () => {
  const exhibition = await read('src/components/ToolExhibition.tsx')
  const css = await read('src/App.css')
  assert.match(exhibition, /<a className="work-visual"/)
  assert.match(exhibition, /<TiltedCard/)
  assert.doesNotMatch(exhibition, /work\.querySelector\('\.work-visual'\), \{ autoAlpha/)
  assert.doesNotMatch(exhibition, /yPercent: -7/)
  assert.match(css, /\.work-tilt-card \.work-tilt-image[^}]*object-fit: contain/)
})

test('hero artwork does not include an extra direction arrow', async () => {
  const hero = await read('src/components/HeroExhibition.tsx')
  assert.doesNotMatch(hero, /MoveDownRight/)
  assert.doesNotMatch(hero, /hero-direction/)
})

test('hero artwork ships high-resolution Maya screenshots', async () => {
  for (const image of ['rig-box.png', 'ck-tool.png', 'scripts-box.png']) {
    const file = await stat(new URL(`../public/media/exhibition/${image}`, import.meta.url))
    assert.ok(file.size > 200_000)
  }
})
