export interface GuideChapter {
  title: string
  summary: string
  steps: string[]
  result: string
  note?: string
}

export interface ToolGuide {
  id: 'rig-box' | 'ck-tool' | 'scripts-box'
  name: string
  eyebrow: string
  accent: string
  intro: string
  source: string
  chapters: GuideChapter[]
}

export const toolGuides: ToolGuide[] = [
  {
    id: 'rig-box',
    name: 'CK Rig Box',
    eyebrow: 'FK CONTROLLER WORKFLOW',
    accent: '#46d7c5',
    intro: '从选中关节链到控制器、层级与约束结果。网页演示可同步预览这套逻辑。',
    source: 'Fk_SetUp_ui.py / Fk_SetUp.py / fk_duplicate_setup.py',
    chapters: [
      { title: '选择与基础设置', summary: '确定处理范围、命名和控制器外观。', steps: ['选择关节或 Transform 层级的根节点。', '在 zero层级、zero简化、GP层级、ADV层级中选择结构。', '填写要移除的名称片段；多个片段用中英文逗号分隔。', '选择 Cube、Circle 或 Square 控制器。'], result: '新节点以清理后的源对象名为主体，并使用统一控制器形状。', note: '多条链可多选根节点；先用短链验证项目命名规则。' },
      { title: '约束类型', summary: '决定控制器向源对象传递哪些变换。', steps: ['Parent 同时传递位移和旋转。', 'Point 只传递位移，Orient 只传递旋转。', 'Scale 传递缩放，默认与 Parent 一起开启。', '若要拆分位移与旋转，关闭 Parent 后组合 Point + Orient。'], result: '源对象只获得已勾选的约束节点。', note: 'Parent 与 Point/Orient 重复使用通常没有必要。' },
      { title: 'FK、次级与末端', summary: '控制控制器之间的层级和细调结构。', steps: ['开启 FK层级模式，让控制器沿源链逐级父子连接。', '开启次级控制器，为每个主控制器增加细调层。', '选择次级归属 Output 或 Ctrl。', '末端仅作标记时开启排除末尾。'], result: '得到可逐级传递的 FK 控制器链，并可选主/次两层控制。' },
      { title: 'FK 复制模式', summary: '保留原链并建立额外的 FK 驱动链。', steps: ['选中原链根节点。', '开启 FK复制模式。', '继续设置层级、形状、约束和次级选项。', '点击创建并约束，检查复制链与原链关系。'], result: '场景中新增一条 FK 复制链及其控制结构。', note: '复制模式会增加节点数量，正式场景中先保存版本。' },
      { title: '定位器与次级', summary: '对已有对象或控制器补充辅助结构。', steps: ['创建定位器：选择对象后点击创建定位器。', '创建次级：选择已有 NURBS 控制器曲线。', '设置次级归属，并按需要开启重建之前的约束。', '点击创建次级并检查原约束是否恢复。'], result: '定位器对齐到选择对象；次级控制层插入现有控制器结构。' },
      { title: '创建并检查', summary: '执行主流程并确认 Outliner 结果。', steps: ['确认根节点和全部选项。', '点击创建并约束。', '检查控制器名称、主次控制器、FK 父子关系。', '检查源对象约束类型及排除末尾是否正确。'], result: '控制器、组织组、Output 与约束形成完整可读的绑定结构。' },
    ],
  },
  {
    id: 'ck-tool',
    name: 'CK Tool',
    eyebrow: 'CONTROLLER TOOLKIT',
    accent: '#ff725e',
    intro: '覆盖曲线显示、控制器创建、层级命名与 Tag 管理。网站只还原 UI 操作，不执行场景命令。',
    source: 'ui.py / ck_tool.py / tool/curve / tool/rig',
    chapters: [
      { title: '曲线大小与通道重置', summary: '固定在窗口顶部的高频控制。', steps: ['选择 NURBS 控制器，设置曲线大小步长。', '使用变大/变小调整 CV；局部中心选项让每个 Shape 围绕自身中心缩放。', '设置曲线粗细后应用到 Shape。', '位移归0、旋转归0、缩放归1分别恢复选择对象通道。'], result: '形状与显示改变，但曲线大小操作不依赖 Transform 缩放。' },
      { title: '控制器颜色', summary: '自定义、预设、随机和渐变四种配色方式。', steps: ['选择控制器 Shape。', '点击颜色预览或预设色块。', '应用颜色，或选择随机/渐变批量配色。', '使用重置颜色恢复默认显示。'], result: '选择曲线的 override 显示颜色更新。' },
      { title: '创建关节与控制器', summary: '按名称、侧别、序号和层级批量创建。', steps: ['填写组名、名称、侧面、大小、数量与编号位数。', '选择 Sphere、Cube、Circle、Arrow、Gear、Diamond 等控制器类型。', '勾选创建关节、控制器、子控制器及名称识别选项。', '使用层级组逻辑时，按原对象层级建立新控制器关系后点击创建。'], result: '生成符合命名规则的关节、控制器与组织组。', note: '识别物体名称时，“忽略后缀”可避免重复序号。' },
      { title: '曲线 Shape 工具', summary: '修改现有控制器的形状结构。', steps: ['镜像曲线形状：把源 Shape 镜像到目标侧。', '替换曲线形状：保留目标 Transform，换入源 Shape。', '添加形状节点：把曲线 Shape 归属到目标 Transform。', '还可重命名 Shape、切换显示在前面、创建次级、合并或拆分曲线。'], result: '控制器 Transform 可保持不变，只调整其可视 Shape 与显示行为。', note: '涉及源/目标的命令先确认选择顺序。' },
      { title: '分组与前缀', summary: '为已有对象补充规范化组织层级。', steps: ['输入自定义前缀或选 zero、driven、connect、offset、space。', '决定是否去除旧前缀、保留后缀、冻结缩放和创建 Locator。', '选择对象并点击创建组。', '按需要使用添加控制器层级、基础层级、创建父/子物体。'], result: '对象获得符合项目命名的父级组织结构。' },
      { title: 'Tag 与骨骼 Tag', summary: '用自定义属性标记并快速召回对象。', steps: ['输入 Tag 名并给选择对象添加 Tag。', '用选择有tag的物体召回同类对象。', '可删除 Tag、识别现有 Tag、使用或清空历史记录。', '骨骼绘制标签和通用骨骼Tag用于 joint 的显示与识别。'], result: '场景对象带有可重复查询的标记属性。', note: '清空历史只清工具记录，不删除场景属性。' },
    ],
  },
  {
    id: 'scripts-box',
    name: 'Scripts Box',
    eyebrow: 'SCRIPT LIBRARY',
    accent: '#f2c94c',
    intro: '在 Maya 内组织、查找、编辑和备份 Python/MEL。网站只展示管理界面与状态。',
    source: 'main_window.py / group_panel.py / code_editor.py / settings_dialog.py',
    chapters: [
      { title: '分组管理', summary: '建立适合个人或项目的脚本目录。', steps: ['点击左侧 + 创建分组。', '右键分组可重命名、删除和设置颜色。', '直接拖动分组按钮调整顺序。', '通过脚本右键菜单把脚本移动到目标分组。'], result: '左侧分组顺序、颜色和脚本数量立即更新。' },
      { title: '脚本按钮', summary: '创建、运行、编辑并整理 Python/MEL。', steps: ['进入目标分组后点击顶部 +。', '填写名称、类型、提示信息和代码并保存。', '单击脚本按钮在 Maya 内运行；网站只显示选择状态。', '右键可编辑、删除、置顶、改提示/颜色、移动分组或打开文件夹。'], result: '脚本以按钮形式保存在当前分组，置顶项排在最前。', note: '运行外部脚本前先审查代码来源和内容。' },
      { title: '搜索、刷新与布局', summary: '跨分组定位脚本并调整显示密度。', steps: ['在顶部搜索框输入脚本名称关键词。', '查看跨分组结果及脚本类型。', '清空搜索或点击清除按钮回到当前分组。', '刷新重新读取文件；设置中可切换单列/双列。'], result: '结果列表随关键词和布局选择更新。' },
      { title: '拖放与编辑器', summary: '快速导入文件并在内置编辑器中维护。', steps: ['把一个或多个 .py/.mel 文件拖入窗口。', '确认目标分组与同名文件处理结果。', '编辑器可修改名称、类型、提示和正文。', '查找栏支持上/下一个、大小写匹配和数量提示。'], result: '导入脚本进入库中；保存后按钮信息与文件同步。' },
      { title: '回收站', summary: '恢复误删内容或进行永久清理。', steps: ['点击左下角回收站。', '对单项恢复/删除，或使用全部恢复。', '确认原分组和删除日期。', '只有确认已有备份后再清空回收站。'], result: '恢复项回到原分组；永久删除项无法从工具内找回。' },
      { title: '导入、导出与工具架', summary: '备份配置、脚本和 Maya Shelf。', steps: ['导出时选择仅配置、仅脚本或配置和脚本。', '导入时优先使用添加配置/脚本模式。', '替换全部前确认自动备份位于 data/backup。', '工具架管理可保存、加载、刷新和删除 Maya Shelf。'], result: '得到可迁移的 config.json、tools 目录或工具架备份。', note: '导入目录必须使用 config.json 和名为 tools 的脚本目录。' },
      { title: '折叠图标', summary: '把管理器收纳为 Maya 内悬浮入口。', steps: ['点击最小化按钮折叠为图标。', '单击临时展开，双击完整恢复。', '拖动图标调整位置。', '设置中更换静态/GIF 图标；右键图标可关闭。'], result: '主窗口隐藏，保留可移动的悬浮访问入口。' },
    ],
  },
]
