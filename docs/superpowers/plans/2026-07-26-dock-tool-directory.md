# Dock 与工具目录实施计划

1. 为 Dock、左侧目录、分类数据与工具跳转补充结构测试；先确认测试因组件尚未实现而失败。
2. 安装 `motion`，实现适配本站视觉的 Dock，并替换顶部文字导航。
3. 建立 `toolCatalog` 单一数据源，实现左侧 LineSidebar 分类与 StaggeredMenu 分层抽屉。
4. 连接“交互台 / 使用说明”跳转，确保工具选择同步到现有工作台和说明区。
5. 加入移动端、触屏、键盘与 `prefers-reduced-motion` 处理，保持 GradualBlur 和全局背景层级正确。
6. 运行测试、lint、构建与依赖审计；在桌面、390×844 和减弱动画模式进行浏览器验收。
7. 仅提交本次功能文件，推送 `main` 并验证 GitHub Pages 部署结果。

