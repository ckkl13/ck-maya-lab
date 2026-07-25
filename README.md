# CK Maya Lab

三个 Maya 工具的交互展示、使用说明与下载网站。

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

当前本地下载包位于 `public/downloads/`。正式发布时建议将 ZIP 上传到 GitHub Releases，并把 `src/data/tools.ts` 中的 `downloadFile` 改为对应 Release 地址，避免网站源码仓库长期保存大文件。

Scripts Box 的内置脚本在公开发布前必须完成来源与许可证确认。
