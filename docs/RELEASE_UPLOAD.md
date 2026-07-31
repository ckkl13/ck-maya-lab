# 工具自动发布与历史归档

## 上传步骤

1. 打开仓库的 **Releases** 页面。
2. 选择 **Draft a new release**。
3. 创建一个未使用过的 Tag，例如 `maya-tools-2026.08.12`。
4. 上传以下三个固定文件名：

   ```text
   ck_rig_Box.zip
   ck-tool.zip
   scripts.box.zip
   ```

5. 确认三个文件全部上传完成后，点击 **Publish release**。
6. 在 **Actions** 页面等待 `Deploy website to GitHub Pages` 完成。

## 自动处理规则

- 版本日期取三个 ZIP 中最后上传文件的时间，并转换为北京时间。
- 页面版本格式为 `vYYYY.MM.DD`。
- 同一天发布多次时，依次显示为 `vYYYY.MM.DD.2`、`vYYYY.MM.DD.3`。
- 最新的完整 Release 自动成为主站下载入口。
- 以前的完整 Release 自动保留在历史下载页，并按时间倒序排列。
- 删除某个 Release 后，历史清单会自动重建。
- 缺少任一固定 ZIP、文件名错误、草稿或预发布版本都不会成为网站下载版本。

## 手动重新同步

如需重新读取全部 Releases，可在 Actions 页面手动运行：

```text
Deploy website to GitHub Pages → Run workflow
```

也可以在本地仓库执行：

```bash
npm run downloads:refresh
npm run build
```
