import generatedHistory from './downloadHistory.generated.json'

export type ToolId = 'ck-rig-box' | 'ck-tool' | 'scripts-box'

export interface DownloadRelease {
  version: string
  date: string
  sizeBytes: number
  downloadUrl: string
  isLatest: boolean
  note: string
}

export interface DownloadToolHistory {
  id: ToolId
  name: string
  category: string
  mayaVersions: 'Maya 2022+'
  platforms: 'Windows.Mac'
  accent: string
  releases: DownloadRelease[]
}

type GeneratedRelease = Omit<DownloadRelease, 'note'> & {
  sourceTag: string
}

const generatedTools = generatedHistory.tools as Record<ToolId, GeneratedRelease[]>

export const downloadHistory: DownloadToolHistory[] = [
  {
    id: 'ck-rig-box',
    name: 'CK Rig Box',
    category: '绑定 / FK',
    mayaVersions: 'Maya 2022+',
    platforms: 'Windows.Mac',
    accent: '#45d6c4',
    releases: generatedTools['ck-rig-box'].map((release) => ({
      ...release,
      note: release.isLatest
        ? '当前稳定版，包含 FK 控制器与层级工具。'
        : '历史归档，可用于旧项目复现与兼容性回退。',
    })),
  },
  {
    id: 'ck-tool',
    name: 'CK Tool',
    category: '控制器 / 效率',
    mayaVersions: 'Maya 2022+',
    platforms: 'Windows.Mac',
    accent: '#efb655',
    releases: generatedTools['ck-tool'].map((release) => ({
      ...release,
      note: release.isLatest
        ? '当前稳定版，包含控制器形状与绑定辅助工具。'
        : '历史归档，可用于旧项目复现与兼容性回退。',
    })),
  },
  {
    id: 'scripts-box',
    name: 'Scripts Box',
    category: '脚本 / 管理',
    mayaVersions: 'Maya 2022+',
    platforms: 'Windows.Mac',
    accent: '#92a7ff',
    releases: generatedTools['scripts-box'].map((release) => ({
      ...release,
      note: release.isLatest
        ? '当前稳定版，支持脚本分组、搜索、编辑与配置管理。'
        : '历史归档，可用于旧项目复现与兼容性回退。',
    })),
  },
]

export function getLatestRelease(toolId: ToolId): DownloadRelease {
  const tool = downloadHistory.find((item) => item.id === toolId)
  const latest = tool?.releases.find((release) => release.isLatest)

  if (!latest) {
    throw new Error(`Latest release not found for ${toolId}`)
  }

  return latest
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const kilobytes = bytes / 1024
  if (kilobytes < 1024) return `${kilobytes.toFixed(1)} KB`

  return `${(kilobytes / 1024).toFixed(1)} MB`
}
