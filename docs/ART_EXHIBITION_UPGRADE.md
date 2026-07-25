# CK Maya Lab 数字艺术工具展览升级规格

## 1. 项目目标

把现有 CK Maya Lab 从“工具下载页 + Maya UI 演示台”升级为具有个人风格的数字艺术工具展览。页面必须首先像作品集和数字展览，其次才像软件下载站，但工具信息、交互演示和下载入口始终清晰。

## 2. 不变边界

- 保留 CK Rig Box、CK Tool、Scripts Box 三个现有交互演示。
- CK Rig Box 可模拟控制器、层级和约束结果。
- CK Tool、Scripts Box 只还原 Maya 内 UI 状态，不执行或伪造 Maya、Python、MEL 功能。
- 保留当前下载链接、版本信息、Maya 兼容范围和使用手册。
- 不重写工具源码，不引入后端。

## 3. 视觉方向

### 3.1 设计定位

数字艺术展览 × Maya 技术工具 × 编辑式排版 × 克制未来主义。

艺术感来自构图、排版、工具画面、留白、空间关系和动画时序，不来自大量霓虹、粒子或组件特效。

### 3.2 色彩

- 主背景：微暖炭黑 `#111315`
- 深层背景：`#0B0D0F`
- 表面：`#181B1E`
- 主文字：冷灰白 `#E8EDF2`
- 次级文字：`#8D989F`
- 全局强调色：冷青 `#46D7C5`
- 浅色叙事背景：`#E9EDF0`

CK Tool 的红橙和 Scripts Box 的黄色只保留在各自 Maya 界面内部，不参与全局导航和背景。

### 3.3 字体

- 中文标题与正文：`Inter, Segoe UI, Microsoft YaHei UI, sans-serif`
- 技术参数、版本、编号：`ui-monospace, Consolas, monospace`
- 不超过两套字体家族，通过字号、字重、行高和字距建立层级。

## 4. 首页叙事结构

### 第一幕：进入展览

- 全屏开场，显示 CK Maya Lab、三件工具、支持 Maya 版本和进入展览入口。
- 主视觉由真实 Maya 工具窗口画面组成，不使用普通卡片。
- 背景使用低对比度光场、细网格和极淡噪点。
- 桌面端鼠标驱动三层小幅视差，离开后平滑回正。

### 第二幕：工具作为作品

- 三件工具分别使用独立编号 `01/02/03`。
- 采用交替构图：大幅工具画面、短描述、版本、查看演示和下载。
- 三件作品不使用等宽卡片网格。
- 图片、编号、标题和参数按构图顺序进入。

### 第三幕：真实交互台

- 保留当前 ToolStudio 及三套 UI。
- 页面视觉上将其作为展览核心装置，而不是首屏控制台。
- 使用统一冷青标记展览层，工具窗口内部保留自身颜色。

### 第四幕：使用叙事

- 保留源码驱动的三工具说明。
- 工具和章节切换由 React state 驱动。
- 步骤、预期结果和注意事项使用顺序动画。
- 桌面端使用短距离 sticky/pinned 感，移动端自然纵向浏览。

### 第五幕：下载终章

- 使用大型文字、版本、更新时间和三个直接下载入口构成结尾。
- GitHub Releases 和完整 Markdown 手册作为次级入口。
- 不伪造下载进度；只提供 hover、pressed 和浏览器原生下载反馈。

## 5. 交互系统

### 5.1 鼠标

- 使用统一 hook 输出标准化指针位置。
- 连续数据保存在 ref/CSS 变量，不触发 React 每帧重渲染。
- 仅驱动背景光场、首屏前中后景和工具图片内部小幅位移。
- 触摸设备、窄屏和 reduced-motion 关闭视差。

### 5.2 滚动

- 使用 GSAP、ScrollTrigger、`@gsap/react` 和 `useGSAP()`。
- 动画只使用 `transform`、`opacity`、`clip-path` 或 CSS 变量。
- 一个区域的线条、编号或背景变化延续到下一区域。
- 不劫持滚动，不做长距离横向滚动，不频繁 pin。

时间令牌：

- micro：120-180ms
- interaction：200-300ms
- section：500-800ms
- cinematic：900-1400ms

### 5.3 动态降级

- `prefers-reduced-motion: reduce`：关闭视差、scrub 和长时间轴。
- 390px/触摸设备：关闭鼠标响应，取消 sticky/pin，缩短进入动画。
- 背景始终有纯 CSS 静态状态。

## 6. 组件边界

```text
src/
├── components/
│   ├── ExhibitionHeader.tsx
│   ├── HeroExhibition.tsx
│   ├── ToolExhibition.tsx
│   ├── ToolStudio.tsx
│   ├── ToolUsageGuides.tsx
│   └── DownloadsSection.tsx
├── hooks/
│   └── usePointerField.ts
├── data/
│   ├── tools.ts
│   └── toolGuides.ts
└── animation/
    └── gsap.ts
```

`App.tsx` 只负责区段组合。每个区段独立管理自己的 GSAP scope 和清理。

## 7. 响应式

- 1440px：完整非对称构图、三层视差、sticky 说明导航。
- 1024px：减少画面重叠和横向位移。
- 768px：工具作品转为自然纵向排列。
- 390px：单列、关闭视差和 pin、保留编号、下载按钮至少 44px 高。
- 所有视口不得出现页面级横向滚动。

## 8. 性能与可访问性

- 鼠标数据使用 `requestAnimationFrame`/GSAP quickTo/CSS 变量。
- 不在 mousemove 中 setState。
- 不使用多个 Canvas/WebGL。
- 图片声明比例并懒加载。
- 所有按钮和链接支持键盘、focus-visible 和清晰名称。
- 重要文字不绘制到 Canvas。
- 所有 GSAP 和 ScrollTrigger 在卸载/更新时清理。

## 9. 验收标准

- 第一印象是数字艺术展览，而不是 SaaS 或工具下载列表。
- 三件工具拥有独立作品节奏，同时属于同一视觉系统。
- 三套 Maya UI 交互不回退。
- CK Tool、Scripts Box 不出现虚假执行结果。
- 桌面鼠标响应克制且连续；触摸设备不模拟鼠标。
- 滚动动画形成连续叙事，不妨碍阅读。
- 390px 无横向溢出、重要内容裁切或不可点击控件。
- reduced-motion 下内容完整。
- 键盘可访问。
- 控制台无错误和 GSAP target 警告。
- lint、类型检查、生产构建和依赖审计通过。

## 10. 实施优先级

### P0：必须完成

- 首屏、三工具作品、交互台、说明、下载终章的完整结构。
- 统一色彩与编辑式排版。
- 鼠标光场、区段进入与工具作品时间轴。
- 桌面和 390px 响应式。

### P1：完成后再加入

- 真实工具界面截图作为首屏和作品画面。
- 下载后的轻量反馈。
- 更细的章节滚动进度。

### 不实施

- WebGL 场景。
- 常见科技粒子网络。
- 自定义光标。
- 页面滚动劫持。
- 大量 React Bits 组件拼接。
- CK Tool、Scripts Box 的虚假功能执行。
