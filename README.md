# CK Maya Lab

三个 Maya 工具的交互展示、使用说明与下载网站。

- 在线网站：https://ckkl13.github.io/ck-maya-lab/
- 下载页面：https://github.com/ckkl13/ck-maya-lab/releases/tag/maya-tools-2026.07

## 本地运行

```bash
npm install
npm run dev
```

## 验证

```bash
npm run lint
npm run build
npm audit
```

## GitHub Pages

1. 将 `site` 目录作为 GitHub 仓库根目录推送到 `main`。
2. 在仓库 `Settings > Pages` 中将 Source 设置为 `GitHub Actions`。
3. 推送后 `.github/workflows/deploy-pages.yml` 会自动构建并发布 `dist`。

Vite 使用相对 `base`，因此 GitHub 用户站点、项目站点和自定义域名都可以加载资源。

## 下载包

本地下载包位于 `public/downloads/`，并通过 `.gitignore` 排除，不进入源码历史。正式下载文件托管在 GitHub Release `maya-tools-2026.07`，网站按钮直接指向对应附件。

Scripts Box 的内置脚本在公开发布前必须完成来源与许可证确认。
