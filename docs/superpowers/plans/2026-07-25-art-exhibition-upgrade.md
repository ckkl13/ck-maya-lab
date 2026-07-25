# CK Maya Lab Art Exhibition Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing CK Maya Lab into a responsive digital-art exhibition while preserving all three interactive Maya demos.

**Architecture:** Keep `App.tsx` as composition glue. Add focused hero and exhibition components, a pointer-field hook that writes CSS variables without React rerenders, and scoped GSAP timelines. Reuse the current tool and guide data as the single source of product copy.

**Tech Stack:** React 19, TypeScript, Vite, GSAP 3, @gsap/react, ScrollTrigger, Lucide.

## Global Constraints

- CK Rig Box may simulate results; CK Tool and Scripts Box remain UI-only.
- Use `#46D7C5` as the only global accent.
- No WebGL, particle network, custom cursor, scroll hijacking, or fake download progress.
- All GSAP selectors are scoped and all animations clean up.
- Touch devices and reduced-motion disable pointer parallax.
- Desktop, 1024px, 768px, and 390px layouts must not overflow horizontally.

---

### Task 1: Structural Contract

**Files:**
- Create: `tests/site-structure.test.mjs`
- Modify: `package.json`

- [ ] Add failing source-contract tests for the five-section narrative, three tool works, pointer hook, and UI-only copy.
- [ ] Run `npm test` and verify failure before the new components exist.
- [ ] Keep the test lightweight and dependency-free with Node's test runner.

### Task 2: Exhibition Shell

**Files:**
- Create: `src/components/ExhibitionHeader.tsx`
- Create: `src/components/HeroExhibition.tsx`
- Create: `src/components/ToolExhibition.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] Build the exhibition header and five-section page order.
- [ ] Build the full-height hero with editorial metadata and layered tool visuals.
- [ ] Build three alternating tool works from `src/data/tools.ts`.
- [ ] Preserve the existing ToolStudio and ToolUsageGuides after the exhibition.
- [ ] Run tests, lint, and build.

### Task 3: Unified Pointer and Motion System

**Files:**
- Create: `src/hooks/usePointerField.ts`
- Modify: `src/components/HeroExhibition.tsx`
- Modify: `src/components/ToolExhibition.tsx`
- Modify: `src/App.css`

- [ ] Write normalized pointer coordinates to CSS variables through requestAnimationFrame.
- [ ] Add three restrained visual depths to the hero.
- [ ] Add scoped GSAP hero, artwork, and section timelines.
- [ ] Disable parallax on touch and reduced-motion.
- [ ] Verify there are no missing-target warnings or leaked ScrollTriggers.

### Task 4: Guide and Download Finale

**Files:**
- Modify: `src/components/ToolUsageGuides.tsx`
- Modify: `src/components/DownloadsSection.tsx`
- Modify: `src/App.css`

- [ ] Connect the guide visually to the exhibition narrative.
- [ ] Keep guide tool/chapter interactions and Markdown download.
- [ ] Redesign downloads as the final exhibition scene with direct, honest links.
- [ ] Test keyboard interaction and download hrefs.

### Task 5: Responsive and Production Verification

**Files:**
- Modify only files that fail verification.

- [ ] Run `npm test`, `npm run lint`, `npm run build`, and `npm audit --audit-level=moderate`.
- [ ] Browser-check 1440px, 1024px, 768px, and 390px.
- [ ] Check tool switching, guide switching, next chapter, downloads, and keyboard focus.
- [ ] Check reduced-motion and touch fallbacks.
- [ ] Confirm no horizontal overflow or console errors.
- [ ] Remove temporary QA files.
- [ ] Commit only intended files, push, wait for GitHub Pages, and verify the live deployment.
