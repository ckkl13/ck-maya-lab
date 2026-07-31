# 三个工具最新版下载包更新设计

## 目标

将 `E:\个人博客\tools` 下的三个工具文件夹重新打包并替换网站当前最新版下载资源，同时删除现有历史归档文件。历史下载页面及未来版本管理能力继续保留。

## 源目录

本次只处理以下三个目录：

- `E:\个人博客\tools\ck_rig_Box`
- `E:\个人博客\tools\ck_tool`
- `E:\个人博客\tools\scripts box`

`E:\个人博客\tools\MayaControllerTool 1.2` 不属于本次发布范围。

## 最新版资源

继续使用 GitHub Release `maya-tools-2026.07`，覆盖以下固定资源：

- `ck_rig_Box.zip`
- `ck-tool.zip`
- `scripts.box.zip`

网站主下载区和历史下载页继续使用这些稳定地址，避免入口变化。

## 打包规则

- 每个 ZIP 保留对应工具文件夹作为顶层目录。
- 包含工具源码、图标、说明文档、安装入口和业务资源。
- 排除所有 `__pycache__` 目录。
- 排除开发环境目录 `.git`、`.venv` 和 `graphify-out`。
- 排除 `.pyc`、`.pyo`、`.bak`、`.log`、`.tmp`、`.DS_Store` 和 `Thumbs.db`。
- Scripts Box 的 `data/backup`、`data/Output` 和 `data/shelves` 只保留空目录，不包含运行时内容。
- 打包后记录文件大小、SHA-256、条目数，并验证入口文件存在。

## 历史文件处理

- 删除 GitHub Release `maya-tools-2026.07.25` 及其中三个历史 ZIP。
- 从 `src/data/downloadHistory.ts` 删除三个 `2026.07.25` 历史记录。
- 不删除 `history.html`、历史页面组件、样式、测试或主站“下载历史版本”入口。
- 历史页的三个工具区域继续显示当前最新版。
- 每个工具区域在没有旧版时显示“当前暂无历史归档”，后续发布新版时可再次加入历史记录。

## 网站同步

- 根据新 ZIP 的实际大小更新历史页最新版文件大小。
- 兼容信息继续统一为 `Maya 2022+`、`Windows.Mac`。
- 最新版 URL 不变。
- 主下载区仍直接下载最新版；历史入口仍打开独立历史页面。

## 验证

- 三个 ZIP 均能解压，且不存在排除项。
- 三个固定 Release 资源的大小和 SHA-256 与本地生成文件一致。
- 历史 Release `maya-tools-2026.07.25` 不再存在。
- 历史页保留三个工具区域、三个最新版记录和三个“当前暂无历史归档”状态。
- 桌面端与 390×844 手机端无横向溢出。
- Vitest、Node 结构测试、Lint、Build 和 Audit 全部通过。
- GitHub Pages 部署完成后，主站下载链接和历史页最新版下载链接均有效。
