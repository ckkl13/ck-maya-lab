# Maya UI Visual Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace simulated exhibition imagery with the supplied Maya screenshots, align CK Tool and Scripts Box with the Rig Box stage, darken the guide, and standardize compatibility copy.

**Architecture:** Keep the existing React component boundaries and interactions. Centralize compatibility copy in `tools.ts`, use public media assets for the supplied screenshots and CK Tool GIF, and limit visual changes to the existing demo/guide CSS classes.

**Tech Stack:** React 19, TypeScript, Vite, GSAP, CSS, Node test runner

## Global Constraints

- CK Tool and Scripts Box remain UI-only demonstrations and never execute Maya, Python, or MEL.
- CK Rig Box keeps its existing simulation behavior.
- Compatibility copy is exactly `Maya 2022+` and `Windows.Mac`.
- `siri.gif` appears only inside the CK Tool window at the current circular-ball position.
- Existing unrelated media deletions stay unstaged.

---

### Task 1: Add visual-alignment regression tests

**Files:**
- Modify: `tests/site-structure.test.mjs`

**Interfaces:**
- Consumes: source text from existing React, data, and CSS files.
- Produces: regression checks for centralized compatibility copy, supplied assets, CK Tool icon placement, and dark guide surfaces.

- [ ] **Step 1: Write failing tests**

Add tests that require:

```js
assert.match(tools, /mayaVersions: 'Maya 2022\+'/)
assert.match(tools, /platforms: 'Windows\.Mac'/)
assert.doesNotMatch(studio, /activeTool\.screenshot/)
assert.match(ckTool, /ck-tool-siri\.gif/)
assert.match(css, /\.usage-guides \{[\s\S]*?background: #0b0d0f;/)
```

- [ ] **Step 2: Run the tests and confirm RED**

Run: `npm test`

Expected: new assertions fail because the platform field, GIF asset reference, screenshot removal, and dark guide styling do not exist yet.

- [ ] **Step 3: Keep tests unchanged through implementation**

Do not weaken string expectations. Later tasks must make these checks pass.

### Task 2: Install the supplied visual assets

**Files:**
- Copy: `E:\个人博客\ck_rig_Box.png` → `public/media/exhibition/rig-box.png`
- Copy: `E:\个人博客\ck_tool.png` → `public/media/exhibition/ck-tool.png`
- Copy: `E:\个人博客\scripts_box.png` → `public/media/exhibition/scripts-box.png`
- Copy: `E:\个人博客\tools\ck_tool\icons\siri.gif` → `public/media/ck-tool-siri.gif`

**Interfaces:**
- Produces: stable public URLs already consumed by `HeroExhibition`/`ToolExhibition`, plus `./media/ck-tool-siri.gif` for `CkToolDemo`.

- [ ] **Step 1: Copy exact files without recompression**

Use `Copy-Item -LiteralPath` for all four files so the user-supplied pixels and GIF animation remain unchanged.

- [ ] **Step 2: Verify file identity**

Run `Get-FileHash` for each source and destination pair.

Expected: every pair has the same SHA-256 hash.

### Task 3: Centralize compatibility copy and remove CK Tool sidebar artwork

**Files:**
- Modify: `src/types/tools.ts`
- Modify: `src/data/tools.ts`
- Modify: `src/components/HeroExhibition.tsx`
- Modify: `src/components/ToolExhibition.tsx`
- Modify: `src/components/ToolStudio.tsx`
- Modify: `src/components/DownloadsSection.tsx`

**Interfaces:**
- `ToolDefinition.platforms: string`
- Every presentation component reads `tool.mayaVersions` and `tool.platforms`.

- [ ] **Step 1: Add the platform field**

Add `platforms: string` to `ToolDefinition`.

- [ ] **Step 2: Update all three records**

Set every record to:

```ts
mayaVersions: 'Maya 2022+',
platforms: 'Windows.Mac',
```

Remove the CK Tool `screenshot` data because the studio sidebar no longer renders it.

- [ ] **Step 3: Replace hardcoded compatibility labels**

Read the values from each tool in the hero, work list, studio, and download finale. The hero-wide summary uses the first record because compatibility is globally uniform.

- [ ] **Step 4: Remove sidebar screenshot rendering**

Delete the `activeTool.screenshot` image branch from `ToolStudio`; retain version, summary, compatibility, and download controls.

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: compatibility and sidebar assertions pass; GIF and dark-guide assertions may still fail.

### Task 4: Replace the CK Tool orb and align both Maya windows

**Files:**
- Modify: `src/demos/CkToolDemo.tsx`
- Modify: `src/App.css`

**Interfaces:**
- CK Tool uses `<img className="ck-siri-image" src="./media/ck-tool-siri.gif" ... />` inside the existing `.ck-siri` button.
- Existing accordion and Scripts Box state logic remain unchanged.

- [ ] **Step 1: Replace generated orb layers**

Replace the decorative `span/i/b` children with the GIF image. Keep the button and accessible label so the existing UI interaction remains.

- [ ] **Step 2: Style the GIF without changing placement**

Make the image fill the circular button with `object-fit: cover`; keep restrained hover/pressed feedback.

- [ ] **Step 3: Harmonize CK Tool surfaces**

Use the Rig Box stage’s border values, dark window surface, titlebar contrast, compact controls, and cyan focus treatment while preserving the real narrow Maya proportions.

- [ ] **Step 4: Harmonize Scripts Box surfaces**

Adjust only surface colors, separators, button depth, selected rows, scrollbar and titlebar. Preserve the sidebar/search/two-column structure and all interactions.

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: CK Tool GIF assertion passes.

### Task 5: Convert the guide to a dark exhibition theme

**Files:**
- Modify: `src/App.css`

**Interfaces:**
- Existing `.usage-guides`, `.guide-*` markup and GSAP transitions remain unchanged.

- [ ] **Step 1: Define dark surfaces**

Set the guide section to `#0b0d0f`, workspace to `#15191c`, secondary panels to `#1b2024`, and chapter panel to `#121619`.

- [ ] **Step 2: Rebalance text and borders**

Use cool white for headings, muted gray for body copy, `#30383e` separators, and cyan only for active state/progress/result.

- [ ] **Step 3: Preserve mobile behavior**

Update mobile tab/chapter separators to the same dark tokens without changing grid/overflow rules.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: all regression tests pass.

### Task 6: Validate, publish, and verify

**Files:**
- No production file changes expected.

**Interfaces:**
- Produces a verified Git commit and GitHub Pages deployment.

- [ ] **Step 1: Run complete local verification**

Run:

```powershell
npm test
npm run lint
npm run build
npm audit --audit-level=moderate
git diff --check
```

Expected: all commands exit 0 and audit reports zero moderate-or-higher vulnerabilities.

- [ ] **Step 2: Browser QA**

Verify desktop and `390x844`:

- supplied screenshots load with nonzero natural dimensions;
- CK Tool sidebar has no image;
- GIF is present only inside CK Tool;
- CK Tool and Scripts Box controls still switch/interact;
- guide is dark;
- exact compatibility labels appear;
- no page-level horizontal overflow;
- reduced-motion content is complete;
- console has no errors/warnings.

- [ ] **Step 3: Commit only intended files**

Stage the plan/spec, tests, four media assets, and modified source files explicitly. Do not stage the three pre-existing deleted media files.

- [ ] **Step 4: Push and verify Pages**

Push `main`, wait for the Pages workflow, compare the live bundle hash with `dist/index.html`, then load the live site and confirm the new assets.

