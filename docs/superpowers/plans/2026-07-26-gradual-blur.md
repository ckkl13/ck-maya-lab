# GradualBlur Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one page-fixed React Bits-style gradual blur at the bottom of CK Maya Lab without blocking tool interaction or adding unused dependencies.

**Architecture:** A typed `GradualBlur` component calculates six bounded backdrop-filter layers from a small curve function and renders them as one decorative fixed overlay. CSS owns page placement, browser fallback, mobile reduction, and z-index ordering relative to content, scan line, navigation, and scene indicator.

**Tech Stack:** React 19, TypeScript, CSS backdrop-filter/mask-image, Node test runner, Vite

## Global Constraints

- Render exactly one page-bottom GradualBlur instance.
- Desktop uses 6 layers, about `7rem` height, strength `1.8`, bezier curve, exponential growth, and opacity about `0.86`.
- Narrow/touch layouts use 4 visible blur layers and about `4.5rem` height.
- The blur must use `pointer-events: none` and `aria-hidden="true"`.
- The fixed navigation, scan line, and scene indicator remain above the blur.
- Do not add `mathjs` or any other runtime dependency.
- Do not modify the three Maya demo behaviors or content.
- Preserve the three user-owned unstaged media deletions.

---

## File Structure

- Create `src/components/GradualBlur.tsx`: typed curve calculation and bounded blur-layer rendering.
- Create `src/components/GradualBlur.css`: fixed positioning, masks, fallback, mobile reduction, and z-index rules.
- Modify `src/App.tsx`: render one configured `GradualBlur` after the existing application content.
- Modify `tests/site-structure.test.mjs`: contract tests for one instance, layer configuration, pointer safety, fallback, and no dependency.

### Task 1: Write the GradualBlur contracts

**Files:**
- Modify: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: UTF-8 source files and `package.json`.
- Produces: tests requiring the component, one App instance, six desktop layers, pointer safety, fallback CSS, and no `mathjs`.

- [ ] **Step 1: Add failing tests**

```js
test('app mounts one page-bottom GradualBlur', async () => {
  const app = await read('src/App.tsx')
  assert.equal((app.match(/<GradualBlur/g) ?? []).length, 1)
  assert.match(app, /position="bottom"/)
  assert.match(app, /divCount=\{6\}/)
  assert.match(app, /strength=\{1\.8\}/)
})

test('GradualBlur is decorative and has a browser fallback', async () => {
  const component = await read('src/components/GradualBlur.tsx')
  const css = await read('src/components/GradualBlur.css')
  assert.match(component, /aria-hidden="true"/)
  assert.match(css, /\.gradual-blur[^}]*pointer-events:\s*none/)
  assert.match(css, /@supports not \(\(backdrop-filter:/)
})

test('GradualBlur adds no unused math dependency', async () => {
  const pkg = await read('package.json')
  assert.doesNotMatch(pkg, /mathjs/)
})
```

- [ ] **Step 2: Verify the tests fail**

Run: `npm test`

Expected: FAIL because `GradualBlur.tsx`, `GradualBlur.css`, and the App instance do not exist.

- [ ] **Step 3: Commit the failing tests**

```powershell
git add -- tests/site-structure.test.mjs
git commit -m "Test GradualBlur integration"
```

### Task 2: Implement the typed component

**Files:**
- Create: `src/components/GradualBlur.tsx`
- Create: `src/components/GradualBlur.css`
- Modify: `src/App.tsx`
- Test: `tests/site-structure.test.mjs`

**Interfaces:**
- Produces:

```ts
type GradualBlurProps = {
  position?: 'top' | 'bottom'
  height?: string
  strength?: number
  divCount?: number
  exponential?: boolean
  curve?: 'linear' | 'bezier' | 'ease-in' | 'ease-out'
  opacity?: number
  className?: string
}
```

- [ ] **Step 1: Implement bounded layer calculation**

Use `useMemo` and a clamped `divCount` from 1 to 10. For each layer, calculate curve progress, exponential or linear blur strength, and a three/four-stop directional mask. Render only presentational `<span>` elements.

- [ ] **Step 2: Add the fixed bottom instance**

```tsx
<GradualBlur
  position="bottom"
  height="7rem"
  strength={1.8}
  divCount={6}
  curve="bezier"
  exponential
  opacity={0.86}
/>
```

- [ ] **Step 3: Add CSS placement and fallback**

Set fixed bottom placement, `z-index: 80`, `pointer-events: none`, and isolation. Use `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))` to replace layer filters with a transparent dark gradient.

- [ ] **Step 4: Verify tests, lint, and build**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit**

```powershell
git add -- src/App.tsx src/components/GradualBlur.tsx src/components/GradualBlur.css
git commit -m "Add page-bottom GradualBlur"
```

### Task 3: Responsive and interaction QA

**Files:**
- Modify only in-scope files if QA exposes a defect.

**Interfaces:**
- Consumes: local Vite app.
- Produces: verified desktop, mobile, pointer safety, z-index ordering, and browser fallback behavior.

- [ ] **Step 1: Desktop QA**

At `1440 × 1000`, verify the bottom `7rem` transitions smoothly from clear to blur, the fixed header and scene indicator remain clear, and tool controls behind the blur remain clickable.

- [ ] **Step 2: Mobile QA**

At `390 × 844`, verify only four layers are visible, height computes to about `4.5rem`, and no horizontal overflow occurs.

- [ ] **Step 3: Browser diagnostics**

Verify `.gradual-blur` has `pointer-events: none`, one instance exists, the console has no warning/error entries, and existing tool switching still works.

- [ ] **Step 4: Fix defects through a red-green cycle**

For each discovered defect, add a focused failing contract test, run it to observe failure, apply the smallest correction, and rerun the suite.

### Task 4: Final verification and deployment

**Files:**
- No planned source changes.

**Interfaces:**
- Consumes: final branch and GitHub Pages workflow.
- Produces: merged, deployed, and live-verified site.

- [ ] **Step 1: Run complete verification**

```powershell
npm test
npm run lint
npm run build
npm audit --audit-level=moderate
git diff --check
```

- [ ] **Step 2: Merge into `main` and verify again**

Fast-forward merge the isolated branch, then rerun the same commands on `main`.

- [ ] **Step 3: Push and verify Pages**

Push `main`, wait for the Pages workflow to succeed, and compare live JS/CSS bundle names with `dist/index.html`.

- [ ] **Step 4: Preserve unrelated local state**

Confirm these remain unstaged:

```text
public/media/ck-tool-ui.png
public/media/controller-library.png
public/media/rig-box-icon.png
```
