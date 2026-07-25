# Dock 顶部导航与左侧工具目录设计

## 目标

使用 React Bits 风格的 Dock、StaggeredMenu 和 LineSidebar 重构 CK Maya Lab 的导航体系。顶部 Dock 负责页面场景跳转，左上角目录按钮打开左侧工具目录；目录支持分类与子目录，使未来新增更多 Maya 脚本时仍能快速定位和维护。

## 顶部导航

- 保留固定顶部栏、CK MAYA LAB 品牌和右侧 GitHub。
- 中央原文字导航替换为 Dock。
- Dock 项目为：首页、作品、交互台、使用说明、下载。
- 鼠标靠近时图标按距离平滑放大，键盘聚焦时显示标签。
- 点击 Dock 项目平滑滚动到现有页面锚点。
- 目录按钮不放入中央 Dock，而是位于顶部左侧品牌旁边。

## 左侧工具目录

- 点击左上角“目录”按钮后，StaggeredMenu 从左侧滑入。
- 两层深灰和青色前置面板先后进入，主面板保持 Maya 深色风格。
- 桌面宽度使用 `clamp(320px, 42vw, 620px)`；移动端占满屏幕。
- 目录按钮在打开后仍固定左上角，并变为关闭按钮。
- 点击面板外、按 Escape 或选择最终工具链接后关闭目录。
- 目录面板具有正确的 `aria-expanded`、`aria-controls`、焦点样式和键盘操作。

## 分类与子目录

目录内部由两级结构组成：

1. 左侧 LineSidebar 显示一级分类。
2. 右侧子目录显示该分类下的工具按钮。

初始分类：

- 绑定与控制器
  - CK Rig Box
  - CK Tool
- 脚本与效率
  - Scripts Box

点击一级分类时，LineSidebar 的标记线、文字位移和颜色响应鼠标距离；右侧工具按钮使用交错动画进入。每个工具提供“交互台”和“使用说明”两个跳转目标。

## 数据模型

新增 `src/data/toolCatalog.ts`，作为目录的唯一维护入口：

```ts
type ToolCatalogGroup = {
  id: string
  label: string
  description: string
  tools: Array<{
    id: string
    name: string
    kind: string
    studioHash: string
    guideHash: string
  }>
}
```

未来新增工具时，只需向分类的 `tools` 数组添加条目；新增大类时添加新的 group。目录组件不写死工具数量。

## 组件边界

### `Dock`

- 只负责顶部页面导航的距离放大、标签和点击回调。
- 使用附件指定的 `motion` 依赖。
- 触屏和减少动态效果下关闭距离放大，保持固定尺寸。

### `ToolDirectory`

- 管理目录开关、当前分类和最终跳转。
- 组合 StaggeredMenu 的左侧分层抽屉与 LineSidebar 的分类交互。
- 工具选中后派发既有 hash/工具选择逻辑，再滚动到对应区域。

### `LineSidebar`

- 使用单一动画帧平滑多个分类的邻近响应。
- 清理动画帧，不产生持续空转循环。

### `StaggeredMenu`

- 只实现当前项目需要的左侧抽屉、前置层、交错子目录和开关动画。
- 使用项目已经存在的 GSAP 与 `useGSAP` 清理模式。
- 不复制附件中的社交链接、图片 Logo 或白色默认主题。

## 与 GradualBlur 的关系

- 页面底部 GradualBlur 保持 `z-index: 80`。
- 顶部栏、Dock 和目录按钮位于 `z-index: 100` 以上。
- 目录抽屉和遮罩位于所有页面内容及 GradualBlur 上方。
- 扫描线与章节指示在普通浏览时清晰；目录打开时由遮罩统一压暗。

## 响应式

- 桌面：中央完整 Dock，左侧目录为双栏布局。
- 760px 以下：Dock 图标缩小并隐藏常驻文字；目录全屏，分类改为顶部横向 LineSidebar，子目录位于下方。
- 触屏：关闭 Dock 距离放大和 LineSidebar 邻近位移，仅保留点击与选中状态。
- 减少动态效果：取消放大、分层滑入和交错位移，目录直接显示/隐藏。

## 性能与依赖

- 新增唯一依赖 `motion`，用于附件指定的 Dock 弹簧放大。
- StaggeredMenu 复用现有 GSAP，不新增第二套时间线库。
- Dock 和 LineSidebar 的高频输入不更新 React state。
- 不为每个工具创建 ScrollTrigger。
- 不安装未使用依赖。

## 验证标准

- 顶部 Dock 五个入口均能跳转到正确场景。
- 左侧目录按钮能打开和关闭目录，抽屉从左侧进入。
- 两个分类与三个现有工具显示正确，子目录切换有交错动画。
- CK Rig Box、CK Tool、Scripts Box 均能从目录进入对应交互台和使用说明。
- 添加模拟的第四个工具数据时无需修改目录组件结构。
- 桌面、390px 移动端和减少动态效果模式无横向溢出。
- GradualBlur、工具演示和现有场景切换保持可用。
- 测试、lint、生产构建和依赖审计通过。

## 非目标

- 不增加后台管理系统或网页上传功能。
- 不把 Scripts Box 内置的每个独立脚本录入网站目录。
- 不重构三个 Maya 工具演示。
