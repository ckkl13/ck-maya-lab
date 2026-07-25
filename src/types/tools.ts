export type ToolId = 'rig-box' | 'ck-tool' | 'scripts-box'

export interface ToolDefinition {
  id: ToolId
  name: string
  shortName: string
  summary: string
  category: string
  version: string
  mayaVersions: string
  accent: string
  screenshot?: string
  downloadFile: string
  features: string[]
}

export interface SceneNode {
  id: string
  name: string
  type: 'joint' | 'controller' | 'group' | 'locator' | 'constraint'
  depth: number
  color?: string
  selected?: boolean
}

export interface LogEntry {
  id: number
  tone: 'info' | 'success' | 'warning'
  message: string
}
