# Refresh Download Packages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用三个本地工具目录生成干净 ZIP、覆盖网站最新版 Release 资源、删除现有历史归档文件，并保留可继续使用的历史下载页面。

**Architecture:** 三个最新版 ZIP 由本地工具目录一次性生成并通过 SHA-256 校验，GitHub Release 使用固定资源名保持主站链接稳定。历史页的数据层只保留最新版记录，组件在没有旧版时渲染明确空状态，未来追加旧版记录时无需修改页面结构。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Python `zipfile`、GitHub CLI、GitHub Releases

## Global Constraints

- 只打包 `ck_rig_Box`、`ck_tool`、`scripts box`。
- 不处理 `MayaControllerTool 1.2`。
- 最新资源名固定为 `ck_rig_Box.zip`、`ck-tool.zip`、`scripts.box.zip`。
- 排除 `__pycache__`、`.git`、`.venv`、`graphify-out`、`.pyc`、`.pyo`、`.bak`、`.log`、`.tmp`、`.DS_Store` 和 `Thumbs.db`。
- Scripts Box 运行时目录只保留空目录。
- 历史页面和入口必须保留。
- 历史 Release `maya-tools-2026.07.25` 必须删除。
- 兼容信息保持 `Maya 2022+`、`Windows.Mac`。

---

### Task 1: 建立隔离工作区并验证基线

**Files:**
- Read: `package.json`
- Read: `src/data/downloadHistory.ts`
- Read: `src/components/DownloadHistoryPage.tsx`

**Interfaces:**
- Consumes: `main` at commit containing the approved design and this plan
- Produces: isolated branch `feature/refresh-download-packages`

- [ ] **Step 1: 创建隔离工作区**

使用 `.worktrees/refresh-download-packages`，确认 `.worktrees` 已被 Git 忽略。

- [ ] **Step 2: 安装依赖并运行基线**

Run:

```powershell
npm install
npm test -- --run
node --test tests/*.test.mjs
npm run lint
npm run build
```

Expected: 全部退出码为 0；主目录三个未提交图片删除不进入工作区。

### Task 2: 生成并验证三个最新版 ZIP

**Files:**
- Create outside Git: `E:\个人博客\artifacts\latest-tools\ck_rig_Box.zip`
- Create outside Git: `E:\个人博客\artifacts\latest-tools\ck-tool.zip`
- Create outside Git: `E:\个人博客\artifacts\latest-tools\scripts.box.zip`

**Interfaces:**
- Consumes: three directories under `E:\个人博客\tools`
- Produces: JSON manifest with `name`, `bytes`, `sha256`, `entries`

- [ ] **Step 1: 用 Python `zipfile` 打包**

配置映射：

```python
PACKAGES = {
    "ck_rig_Box": "ck_rig_Box.zip",
    "ck_tool": "ck-tool.zip",
    "scripts box": "scripts.box.zip",
}
EXCLUDED_DIRS = {"__pycache__", ".git", ".venv", "graphify-out"}
EXCLUDED_SUFFIXES = {".pyc", ".pyo", ".bak", ".log", ".tmp"}
EXCLUDED_NAMES = {".DS_Store", "Thumbs.db"}
```

每个条目以源文件夹名为 ZIP 顶层目录；Scripts Box 的 `data/backup`、`data/Output`、`data/shelves` 仅写目录条目。

- [ ] **Step 2: 验证结构与排除项**

必须存在：

```text
ck_rig_Box/__init__.py
ck_tool/ck_tool.py
ck_tool/install_ck_tool.py
scripts box/install_scripts_box.py
scripts box/core/scripts_box.py
```

Expected: 排除项数量为 0，每个 ZIP 能完整读取。

- [ ] **Step 3: 输出发布清单**

输出每个 ZIP 的字节数、条目数和大写 SHA-256，供网站数据和 Release 对比使用。

### Task 3: 历史页只保留最新版并显示空状态

**Files:**
- Modify: `src/data/downloadHistory.test.ts`
- Modify: `src/components/DownloadHistoryPage.test.tsx`
- Modify: `src/data/downloadHistory.ts`
- Modify: `src/components/DownloadHistoryPage.tsx`
- Modify: `src/history.css`
- Modify: `tests/history-downloads.test.mjs`

**Interfaces:**
- Consumes: Task 2 的三个实际 ZIP 字节数
- Produces: each tool has one latest release and no archived release
- Produces: `.history-empty-state` rendered once per tool

- [ ] **Step 1: 写失败测试**

数据测试新增：

```ts
for (const tool of downloadHistory) {
  expect(tool.releases).toHaveLength(1)
  expect(tool.releases[0].isLatest).toBe(true)
}
```

组件测试新增：

```ts
expect(html.match(/history-empty-state/g)).toHaveLength(3)
expect(html).toContain('当前暂无历史归档')
```

Node 结构测试断言 `downloadHistory.ts` 不包含 `maya-tools-2026.07.25`。

- [ ] **Step 2: 运行测试并确认因旧记录仍存在而失败**

Run:

```powershell
npm test -- --run src/data/downloadHistory.test.ts src/components/DownloadHistoryPage.test.tsx
node --test tests/history-downloads.test.mjs
```

Expected: FAIL，原因是每个工具仍有两条记录、页面没有空状态。

- [ ] **Step 3: 最小实现**

删除 `archiveBase` 与三个历史记录，把最新版 `sizeBytes` 更新为 Task 2 的实际值。在每个 `.history-release-list` 末尾，当 `tool.releases.every((release) => release.isLatest)` 时渲染：

```tsx
<div className="history-empty-state">
  <span>ARCHIVE EMPTY</span>
  <p>当前暂无历史归档</p>
</div>
```

- [ ] **Step 4: 增加响应式空状态样式**

空状态使用现有工具强调色、虚线边框与低对比文字，不新增永久动画。

- [ ] **Step 5: 运行测试并确认通过**

Run:

```powershell
npm test -- --run
node --test tests/*.test.mjs
```

Expected: Vitest 与 Node 测试全部通过。

- [ ] **Step 6: 提交网站变更**

```powershell
git add src/data/downloadHistory.ts src/data/downloadHistory.test.ts src/components/DownloadHistoryPage.tsx src/components/DownloadHistoryPage.test.tsx src/history.css tests/history-downloads.test.mjs
git commit -m "feat: refresh latest tool downloads"
```

### Task 4: 替换最新版资源并删除历史 Release

**Files:**
- Modify externally: GitHub Release `maya-tools-2026.07`
- Delete externally: GitHub Release and tag `maya-tools-2026.07.25`

**Interfaces:**
- Consumes: Task 2 ZIP files and manifest
- Produces: three uploaded assets whose size and SHA-256 match local files

- [ ] **Step 1: 覆盖最新版资源**

Run:

```powershell
gh release upload maya-tools-2026.07 `
  "E:\个人博客\artifacts\latest-tools\ck_rig_Box.zip" `
  "E:\个人博客\artifacts\latest-tools\ck-tool.zip" `
  "E:\个人博客\artifacts\latest-tools\scripts.box.zip" `
  --repo ckkl13/ck-maya-lab --clobber
```

- [ ] **Step 2: 对比 Release 资源**

Run:

```powershell
gh release view maya-tools-2026.07 --repo ckkl13/ck-maya-lab --json assets
```

Expected: 三个资源均为 `uploaded`，文件名、字节数和 digest 与本地清单一致。

- [ ] **Step 3: 删除历史 Release 和标签**

Run:

```powershell
gh release delete maya-tools-2026.07.25 --repo ckkl13/ck-maya-lab --cleanup-tag --yes
```

Expected: 再次查询该标签返回不存在。

### Task 5: 合并、部署和线上验证

**Files:**
- Merge: `feature/refresh-download-packages` into `main`

**Interfaces:**
- Produces: deployed `history.html` with three latest downloads and three empty archive states

- [ ] **Step 1: 完整验证**

Run:

```powershell
npm test -- --run
node --test tests/*.test.mjs
npm run lint
npm run build
npm audit --audit-level=moderate
```

Expected: 全部退出码为 0。

- [ ] **Step 2: 桌面与手机浏览器 QA**

验证桌面端和 `390×844`：三个工具区域、最新版下载、三个空历史状态、无横向溢出、控制台无错误。

- [ ] **Step 3: 合并并推送**

合并到 `main`，保留主目录中原有三个图片删除状态；推送 `origin/main`。

- [ ] **Step 4: 等待 GitHub Pages**

Expected: `Deploy website to GitHub Pages` 对目标提交返回 `success`。

- [ ] **Step 5: 线上核验**

验证：

```text
https://ckkl13.github.io/ck-maya-lab/
https://ckkl13.github.io/ck-maya-lab/history.html
```

最新版链接必须下载新 ZIP；历史 Release URL 必须返回不存在。

