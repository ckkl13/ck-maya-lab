# 工具历史版本下载页设计

## 目标

在不改变三个工具现有“最新版”下载地址的前提下，为网站增加独立历史版本页面，并把 `E:\个人博客\tools\scripts box` 的最新源码重新打包后更新到最新版 Scripts Box 下载资源。

## 页面结构

- 主站下载区域增加“下载历史版本”入口，跳转到独立的 `history.html`。
- 历史页按三个工具分区：
  - CK Rig Box
  - CK Tool
  - Scripts Box
- 每个分区按发布日期倒序展示版本。
- 每条版本记录包含版本号、发布日期、文件大小、Maya/平台兼容信息、版本状态和 ZIP 下载按钮。
- 每个工具当前下载地址对应的 ZIP 始终标记为“最新版”。

## 版本与文件规则

- 最新版下载继续使用 GitHub Release `maya-tools-2026.07` 下的固定文件名：
  - `ck_rig_Box.zip`
  - `ck-tool.zip`
  - `scripts.box.zip`
- Scripts Box 更新前的 ZIP 归档到带日期的历史 Release；更新后的 ZIP 替换固定最新版资源。
- CK Rig Box 与 CK Tool 当前 ZIP 保持不变，并继续作为最新版。
- 历史页面数据集中维护，后续增加版本只需要增加一条数据记录。

## Scripts Box 打包规则

- ZIP 顶层目录保留为 `scripts box/`。
- 包含源码、README、安装脚本及必要的空目录。
- 排除 `__pycache__`、`.pyc`、`.pyo`、`.bak`、日志和临时文件。
- 排除运行时备份、输出和工具架缓存内容，但保留对应空目录。
- 打包后检查入口文件、核心 Python 文件、压缩包结构与排除项。

## 视觉与交互

- 历史页延续主站深色、青绿色强调色与轻量入场动画。
- 三个工具区域有明确的视觉分隔，桌面端使用宽表格式，移动端切换为卡片布局。
- 动画仅使用 `transform` 和 `opacity`，并遵循 `prefers-reduced-motion`。
- 下载按钮使用现有 Dock 风格的悬浮反馈。

## 验证标准

- 主下载页能打开独立历史页。
- 历史页三个区域均可见，最新版标识正确。
- 所有下载链接返回可下载 ZIP。
- Scripts Box 新 ZIP 不含缓存或备份文件，且安装入口存在。
- `npm test`、`npm run lint`、`npm run build`、`npm audit --audit-level=moderate` 全部通过。
- 桌面端与 390×844 手机端无横向溢出，控制台无错误。
