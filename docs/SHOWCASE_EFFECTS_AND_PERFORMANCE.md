# CK Maya Lab 工具展示效果与性能维护文档

## 1. 本次升级目标

工具展示需要比静态截图更有空间感，但不能依赖高开销的 Canvas、WebGL、长时间粒子或每帧 React 重渲染。本次效果建立在现有 `TiltedCard`、GSAP 和 CSS 上，并保持 Maya 工具截图完整可读。

## 2. 展示效果

### 2.1 指针倾斜与图片微视差

- 鼠标进入卡片时只读取一次卡片边界。
- 指针坐标通过 `requestAnimationFrame` 合并到每帧一次更新。
- 卡片旋转继续使用 Motion spring，图片只做最多约 5px 的反向位移。
- 离开卡片时恢复旋转、缩放、光点位置和图片位移。

### 2.2 局部光场

- 光场由单个 CSS 径向渐变组成，位置跟随与倾斜相同的坐标数据。
- 仅在桌面精细指针悬浮或键盘聚焦时显示。
- 触摸设备和 `prefers-reduced-motion: reduce` 下关闭。

### 2.3 展览 HUD

每张工具图增加以下轻量信息层：

- `MAYA / UI ARCHIVE` 档案标识。
- `01 / 02 / 03` 当前工具序列。
- `INTERACTIVE PREVIEW` 状态标记。
- 可交互入口与方向箭头。
- 两个角标在悬浮时扩展，底部能量线从短线展开。

所有 HUD 元素都设置为 `pointer-events: none`，不会阻挡工具链接。

### 2.4 滚动进入

工具编号、截图、HUD、说明和功能列表由同一条 GSAP timeline 编排。ScrollTrigger 只负责启动和反向播放，不使用 pin，也不创建持续运行的循环动画。

## 3. 性能策略

### 高频交互

- 不在 `pointermove` 中调用 React `setState`。
- 卡片尺寸在 `pointerenter` 缓存，不在每次移动时重复执行布局读取。
- 指针更新通过一个 `requestAnimationFrame` 队列合并。
- 动画只修改 `transform`、`opacity` 和少量 CSS 变量。

### 图像与绘制

- 首屏三张截图使用 eager 加载，后续工具展示使用 lazy 加载与异步解码。
- 展示卡使用 `contain: paint`，把光场和边缘效果限制在卡片内部。
- 不给所有元素常驻设置 `will-change`，避免长期占用合成层内存。
- 不添加 Canvas、WebGL、视频背景或持续粒子系统。

### JavaScript 首包

- 动画入口只注册实际使用的 `useGSAP` 和 `ScrollTrigger`。
- 未使用的 `Flip`、`Draggable` 不进入生产首包。
- 本次生产主包由约 544KB 降至约 490KB，gzip 由约 186KB 降至约 167KB。

### 响应式降级

- `820px` 以下保留完整截图和 HUD，不启用鼠标倾斜。
- `520px` 以下隐藏次要档案文字和状态文字，只保留序列与查看入口。
- 触摸设备关闭局部光场和图片视差。
- reduced-motion 模式关闭局部光场、3D 透视和图片位移。

## 4. 主要文件

- `src/components/TiltedCard.tsx`：指针采样、边界缓存、Motion spring 与清理。
- `src/components/TiltedCard.css`：局部光场、图片微视差和移动端降级。
- `src/components/ToolExhibition.tsx`：工具 HUD 与 GSAP 进入时间线。
- `src/App.css`：展示区布局、角标、序列、状态和悬浮反馈。
- `tests/site-structure.test.mjs`：效果存在性与性能约束回归测试。

## 5. 后续添加工具

1. 在 `src/data/tools.ts` 添加工具定义。
2. 在 `public/media/exhibition/` 放入清晰截图，优先使用 PNG 或 WebP。
3. 在 `ToolExhibition.tsx` 的 `artwork` 映射中登记图片路径。
4. 确认图片使用 `object-fit: contain`，不要为不同截图强制同一裁剪比例。
5. 若工具数量超过 6 个，把序列 HUD 改为当前编号和总数，避免生成过多小节点。
6. 在 1440px、1024px、390px 和触摸设备上检查完整显示、键盘焦点和内存占用。

## 6. 验收命令

```bash
npm test
npm run lint
npm run build
npm audit --audit-level=moderate
```

浏览器验收需覆盖：工具卡悬浮、键盘聚焦、进出视口、滚动反向、移动端完整截图、reduced-motion 和控制台错误。

## 7. 当前验收基线

- 桌面端工具卡局部光场、图片微视差、HUD 和边缘展开正常。
- 390×844 下无横向溢出，次要 HUD 与局部光场按规则关闭。
- 本地页面 JavaScript 堆使用约 20MB；该数值用于回归对比，不等同于浏览器进程总内存。
- 自动化测试、lint、生产构建和 moderate 级依赖审计全部通过。
