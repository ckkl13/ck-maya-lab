import type { ToolId } from '../types/tools'

export interface ToolCatalogItem {
  id: ToolId
  name: string
  kind: string
  accent: string
}

export interface ToolCatalogGroup {
  id: string
  label: string
  description: string
  tools: ToolCatalogItem[]
}

export const toolCatalog: ToolCatalogGroup[] = [
  {
    id: 'rigging',
    label: '绑定与控制器',
    description: '控制器创建、层级搭建与绑定辅助',
    tools: [
      { id: 'rig-box', name: 'CK Rig Box', kind: 'FK CONTROLLER', accent: '#46d7c5' },
      { id: 'ck-tool', name: 'CK Tool', kind: 'CONTROLLER KIT', accent: '#ff725e' },
    ],
  },
  {
    id: 'workflow',
    label: '脚本与效率',
    description: 'Maya 脚本整理、检索与日常工作流',
    tools: [
      { id: 'scripts-box', name: 'Scripts Box', kind: 'SCRIPT MANAGER', accent: '#f2c94c' },
    ],
  },
]
