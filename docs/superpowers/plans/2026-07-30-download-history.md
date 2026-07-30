# Download History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 上传最新 Scripts Box 工具包，并为三个 Maya 工具增加可维护的独立历史版本下载页。

**Architecture:** 使用集中式 TypeScript 数据模块描述工具与版本，独立 React 入口渲染 `history.html`，主下载区只负责导航。二进制文件由 GitHub Release 承载，最新版固定链接不变，旧版使用日期化 Release URL。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、GSAP、GitHub Releases、PowerShell

## Global Constraints

- 三个工具现有 ZIP 始终作为各自最新版。
- 全站兼容信息统一为 `Maya 2022+`、`Windows.Mac`。
- 浏览器只提供下载与界面展示，不执行 Python、MEL 或 Maya 功能。
- 历史页必须是独立页面并按三个工具分区。
- Scripts Box 包必须排除 Python 缓存、备份与临时文件。

---

### Task 1: 历史版本数据与验证

**Files:**
- Create: `src/data/downloadHistory.ts`
- Create: `src/data/downloadHistory.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `downloadHistory: DownloadToolHistory[]`
- Produces: `getLatestRelease(toolId: ToolId): DownloadRelease`
- Produces: `formatFileSize(bytes: number): string`

- [ ] **Step 1: 安装 Vitest 并写失败测试**

测试三类行为：三个工具分区都存在、每个工具只有一个最新版、文件大小格式化稳定。

- [ ] **Step 2: 运行测试并确认因模块缺失而失败**

Run: `npm test -- --run`
Expected: FAIL because `downloadHistory.ts` does not exist.

- [ ] **Step 3: 实现最小数据模块**

定义 `ToolId`、`DownloadRelease`、`DownloadToolHistory`，加入三个工具及当前 Release 数据，实现最新版查询和文件大小格式化。

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm test -- --run`
Expected: PASS.

### Task 2: 独立历史下载页面

**Files:**
- Create: `src/components/DownloadHistoryPage.tsx`
- Create: `src/components/DownloadHistoryPage.test.tsx`
- Create: `src/history.tsx`
- Create: `history.html`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `downloadHistory`, `formatFileSize`
- Produces: standalone page at `history.html`

- [ ] **Step 1: 写失败的服务端渲染测试**

断言页面包含三个工具标题、三个“最新版”状态和返回主展览入口。

- [ ] **Step 2: 运行测试并确认因组件缺失而失败**

Run: `npm test -- --run src/components/DownloadHistoryPage.test.tsx`
Expected: FAIL because `DownloadHistoryPage.tsx` does not exist.

- [ ] **Step 3: 实现页面、独立入口和响应式样式**

用语义化 section/article 渲染版本分区；加入轻量 GSAP 入场、减少动态支持、移动端布局。

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm test -- --run`
Expected: PASS.

### Task 3: 主站历史入口

**Files:**
- Modify: `src/components/DownloadsSection.tsx`
- Modify: `src/components/DownloadsSection.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Produces: link to `./history.html`

- [ ] **Step 1: 写失败测试**

服务端渲染 `DownloadsSection` 并断言存在 `./history.html` 链接与“下载历史版本”文本。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/components/DownloadsSection.test.tsx`
Expected: FAIL because history link is absent.

- [ ] **Step 3: 添加入口并复用现有按钮样式**

在下载区标题区域加入历史页按钮，不改变三个最新版 ZIP 按钮。

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm test -- --run`
Expected: PASS.

### Task 4: Scripts Box 打包与 GitHub Release

**Files:**
- Create: temporary build artifact outside Git tracking: `E:\个人博客\artifacts\scripts-box.zip`
- Modify: GitHub Release assets only

**Interfaces:**
- Consumes: `E:\个人博客\tools\scripts box`
- Produces: validated `scripts-box.zip`
- Produces: historical Release asset and replaced latest Release asset

- [ ] **Step 1: 保存当前最新版 Scripts Box ZIP 到日期化历史 Release**

复制并校验网站当前 `scripts-box.zip`，创建或更新日期化历史 Release。

- [ ] **Step 2: 生成最新清洁 ZIP**

使用 PowerShell/.NET Zip API 保留空目录，排除缓存、备份、日志、临时文件。

- [ ] **Step 3: 验证 ZIP**

检查顶层目录、`install_scripts_box.py`、`core/scripts_box.py`，并断言排除项数量为 0。

- [ ] **Step 4: 替换最新版 Release 资源**

上传新 ZIP 覆盖 `maya-tools-2026.07/scripts-box.zip`，保留 CK Rig Box 与 CK Tool 资源不变。

### Task 5: 全量验证与部署

**Files:**
- Modify: committed source files from Tasks 1–3

**Interfaces:**
- Produces: deployed GitHub Pages history page

- [ ] **Step 1: 运行自动验证**

Run: `npm test -- --run`
Run: `npm run lint`
Run: `npm run build`
Run: `npm audit --audit-level=moderate`

- [ ] **Step 2: 浏览器验证**

检查桌面与 390×844：历史入口、三个区域、下载链接、控制台、横向溢出。

- [ ] **Step 3: 提交并推送**

只提交历史页、测试、样式、数据与设计文档；不提交工具 ZIP。

- [ ] **Step 4: 验证线上页面与 Release**

确认 GitHub Pages 工作流成功，线上 `history.html` 可打开，最新版与历史 ZIP 可下载。
