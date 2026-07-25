# Global Interactive Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a medium-intensity site-wide pointer-responsive background and cinematic scroll-linked transitions across the five main exhibition scenes.

**Architecture:** A new fixed `GlobalInteractiveBackground` owns purely decorative visual layers and the shared pointer field. A separate `SceneTransitions` component discovers five explicitly marked scenes and coordinates bounded ScrollTrigger animations, scene progress, and the transition scan line without coupling to any Maya demo state.

**Tech Stack:** React 19, TypeScript, GSAP, `@gsap/react`, ScrollTrigger, CSS custom properties, Node test runner, Vite

## Global Constraints

- Do not change the behavior or content of the three Maya tool demos.
- Keep all decorative background layers `pointer-events: none` and `aria-hidden="true"`.
- Do not introduce Canvas, WebGL, new runtime dependencies, scroll snapping, or long pinned sections.
- Fine-pointer desktop receives the full effect; touch devices receive scroll-only reduced motion.
- `prefers-reduced-motion: reduce` disables pointer parallax, scan movement, and scene transforms.
- High-frequency interaction must not use React state and must animate transform, opacity, or CSS custom properties only.
- Preserve the three user-owned unstaged media deletions.

---

## File Structure

- Create `src/components/GlobalInteractiveBackground.tsx`: render global decorative layers and run the site-wide pointer field.
- Create `src/components/SceneTransitions.tsx`: coordinate five scene ScrollTriggers and update scene/progress indicators.
- Modify `src/App.tsx`: mount both global components around the existing five scenes.
- Modify `src/hooks/usePointerField.ts`: make the existing pointer hook reusable at page scope while retaining frame batching and reduced-motion checks.
- Modify five existing scene components: add stable `data-scene` and `data-scene-index` attributes only.
- Modify `src/App.css`: style the fixed background, translucent scene surfaces, scene progress, scan line, responsive behavior, and reduced-motion fallback.
- Modify `tests/site-structure.test.mjs`: add static contracts for the background, scene markers, cleanup, pointer safety, and reduced-motion CSS.

### Task 1: Lock the global background contracts with failing tests

**Files:**
- Modify: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: existing source files as UTF-8 strings.
- Produces: tests requiring `GlobalInteractiveBackground`, `SceneTransitions`, five scene markers, no React pointer state, and reduced-motion CSS.

- [ ] **Step 1: Write the failing tests**

Add tests equivalent to:

```js
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
  assert.match(css, /\.global-interactive-background[^}]*pointer-events: none/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
})
```

- [ ] **Step 2: Run the focused test file and verify failure**

Run: `npm test`

Expected: FAIL because the two new components and scene markers do not exist.

- [ ] **Step 3: Commit the failing tests**

```powershell
git add -- tests/site-structure.test.mjs
git commit -m "Test global background contracts"
```

### Task 2: Build the fixed interactive background

**Files:**
- Create: `src/components/GlobalInteractiveBackground.tsx`
- Modify: `src/hooks/usePointerField.ts`
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Test: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: `usePointerField(scope: RefObject<HTMLElement | null>)`.
- Produces: `<GlobalInteractiveBackground />`, `.global-interactive-background`, `.global-grid-*`, `.global-particle-*`, `.global-scan-line`, and shared `--global-*` CSS variables.

- [ ] **Step 1: Render one decorative background from `App`**

Implement a fixed component with:

```tsx
export function GlobalInteractiveBackground() {
  const scope = useRef<HTMLDivElement>(null)
  usePointerField(scope)

  return (
    <div ref={scope} className="global-interactive-background" aria-hidden="true">
      <div className="global-light-field" />
      <div className="global-grid global-grid-far" />
      <div className="global-grid global-grid-near" />
      <div className="global-particle-field">{/* bounded static nodes */}</div>
      <div className="global-scan-line" />
    </div>
  )
}
```

Mount it once before `<ExhibitionHeader />`.

- [ ] **Step 2: Extend pointer coordinates to viewport scope**

Keep one `requestAnimationFrame`, `prefers-reduced-motion`, `(pointer: fine)`, cleanup, and no state updates. For fixed page scope, normalize against `window.innerWidth` and `window.innerHeight`; expose `--global-pointer-x`, `--global-pointer-y`, and existing depth variables.

- [ ] **Step 3: Add minimal fixed-layer CSS**

Use fixed positioning, `inset: 0`, `z-index: 0`, isolation, and `pointer-events: none`. Use only transform and opacity for moving grids and particle wrappers. Keep content and header above the background.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: background mounting and pointer-safety contracts pass; scene-marker contract still fails.

- [ ] **Step 5: Commit**

```powershell
git add -- src/App.tsx src/App.css src/components/GlobalInteractiveBackground.tsx src/hooks/usePointerField.ts
git commit -m "Add site-wide interactive background"
```

### Task 3: Add cinematic scene transitions

**Files:**
- Create: `src/components/SceneTransitions.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/HeroExhibition.tsx`
- Modify: `src/components/ToolExhibition.tsx`
- Modify: `src/components/ToolStudio.tsx`
- Modify: `src/components/ToolUsageGuides.tsx`
- Modify: `src/components/DownloadsSection.tsx`
- Modify: `src/App.css`
- Test: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: elements matching `[data-scene]` and `.global-scan-line`.
- Produces: `<SceneTransitions />`, CSS variables `--scene-progress`, `--scene-shift`, and a fixed `.scene-indicator`.

- [ ] **Step 1: Add stable scene metadata**

Add these exact values:

```tsx
data-scene="hero" data-scene-index="01"
data-scene="works" data-scene-index="02"
data-scene="studio" data-scene-index="03"
data-scene="guide" data-scene-index="04"
data-scene="downloads" data-scene-index="05"
```

- [ ] **Step 2: Implement the coordinator**

Use `useGSAP`, `gsap.matchMedia()`, and scoped cleanup. Create at most one entry tween and one lightweight progress ScrollTrigger per scene. Desktop motion:

```ts
gsap.fromTo(scene, { y: 38, autoAlpha: 0.82, scale: 0.992 }, {
  y: 0,
  autoAlpha: 1,
  scale: 1,
  ease: 'none',
  scrollTrigger: { trigger: scene, start: 'top 92%', end: 'top 56%', scrub: 0.6 },
})
```

Update the active scene indicator when a scene crosses the viewport center. Trigger the scan line once per active-scene change; do not pin or snap.

- [ ] **Step 3: Add indicator and transition CSS**

Position the scene indicator at the right viewport edge on desktop. Keep it subtle and non-interactive. Hide its label on narrow screens and hide transform animations under reduced motion.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: all structure tests pass.

- [ ] **Step 5: Commit**

```powershell
git add -- src/App.tsx src/App.css src/components/SceneTransitions.tsx src/components/HeroExhibition.tsx src/components/ToolExhibition.tsx src/components/ToolStudio.tsx src/components/ToolUsageGuides.tsx src/components/DownloadsSection.tsx
git commit -m "Blend exhibition scenes on scroll"
```

### Task 4: Integrate the background through every scene

**Files:**
- Modify: `src/App.css`
- Test: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: global background and existing scene class names.
- Produces: translucent dark scene surfaces that expose the shared background without reducing Maya UI contrast.

- [ ] **Step 1: Adjust scene surfaces**

Change only primary scene backgrounds to alpha dark surfaces or layered transparent gradients. Keep `.maya-window`, `.studio-stage`, `.guide-workspace`, CK Tool, Scripts Box, header, download rows, and text panels opaque enough for readability.

- [ ] **Step 2: Add mobile and reduced-motion rules**

At touch/narrow breakpoints, remove pointer-driven particle offsets and scene scaling. Under `prefers-reduced-motion: reduce`, set all global transforms to none, hide `.global-scan-line`, and ensure scene opacity remains `1`.

- [ ] **Step 3: Run static verification**

Run:

```powershell
npm test
npm run lint
npm run build
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 4: Commit**

```powershell
git add -- src/App.css tests/site-structure.test.mjs
git commit -m "Integrate interactive background across scenes"
```

### Task 5: Browser QA and deployment

**Files:**
- Modify only if QA finds an in-scope defect.

**Interfaces:**
- Consumes: production build and GitHub Pages workflow.
- Produces: verified desktop/mobile/reduced-motion behavior and a deployed main branch.

- [ ] **Step 1: Run complete local verification**

Run:

```powershell
npm test
npm run lint
npm run build
npm audit --audit-level=moderate
git diff --check
```

Expected: tests, lint, build, audit, and diff checks pass.

- [ ] **Step 2: Desktop browser QA**

At `1440 × 1000`, verify:

- pointer response is visible in all five scenes;
- the scan line and scene indicator change at scene boundaries;
- Maya UI buttons, inputs, accordions, tabs, and links remain clickable;
- no console warnings or errors;
- background never covers text or tool windows.

- [ ] **Step 3: Mobile and reduced-motion QA**

At `390 × 844`, verify no horizontal overflow and no touch-following motion. Emulate reduced motion and verify scene transforms and scan animation are disabled.

- [ ] **Step 4: Push and verify Pages**

Push `main`, wait for `Deploy website to GitHub Pages`, verify the workflow conclusion is `success`, compare the live JS/CSS bundle names with `dist/index.html`, and perform a final live smoke check.

- [ ] **Step 5: Preserve unrelated changes**

Confirm these remain unstaged and uncommitted:

```text
public/media/ck-tool-ui.png
public/media/controller-library.png
public/media/rig-box-icon.png
```
