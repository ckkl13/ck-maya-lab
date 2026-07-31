import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repository = process.env.GITHUB_REPOSITORY || 'ckkl13/ck-maya-lab'
const requiredAssets = {
  'ck-rig-box': 'ck_rig_Box.zip',
  'ck-tool': 'ck-tool.zip',
  'scripts-box': 'scripts.box.zip',
}

function readArguments(argumentsList) {
  const options = {}

  for (let index = 0; index < argumentsList.length; index += 2) {
    const key = argumentsList[index]
    const value = argumentsList[index + 1]

    if (!key?.startsWith('--') || !value) {
      throw new Error(`Invalid argument near "${key ?? ''}"`)
    }

    options[key.slice(2)] = value
  }

  return options
}

async function fetchReleases() {
  const releases = []
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ck-maya-lab-release-history',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  for (let page = 1; ; page += 1) {
    const response = await fetch(
      `https://api.github.com/repos/${repository}/releases?per_page=100&page=${page}`,
      { headers },
    )

    if (!response.ok) {
      throw new Error(`GitHub Releases request failed: ${response.status} ${response.statusText}`)
    }

    const pageReleases = await response.json()
    releases.push(...pageReleases)

    if (pageReleases.length < 100) break
  }

  return releases
}

function shanghaiDate(timestamp) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(timestamp))
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))

  return `${values.year}-${values.month}-${values.day}`
}

function inspectRelease(release) {
  const assets = new Map(release.assets.map((item) => [item.name, item]))
  const missing = Object.values(requiredAssets).filter((name) => !assets.has(name))

  if (release.draft || release.prerelease || missing.length > 0) {
    return { release, assets, missing, valid: false }
  }

  const uploadedAt = Object.values(requiredAssets)
    .map((name) => assets.get(name).created_at)
    .sort()
    .at(-1)

  return {
    release,
    assets,
    missing,
    valid: true,
    uploadedAt,
    date: shanghaiDate(uploadedAt),
  }
}

export function buildManifest(releases, requireTag) {
  const inspected = releases.map(inspectRelease)

  if (requireTag) {
    const requiredRelease = inspected.find(({ release }) => release.tag_name === requireTag)

    if (!requiredRelease) {
      throw new Error(`Release "${requireTag}" was not returned by the GitHub API`)
    }

    if (!requiredRelease.valid) {
      const reason = requiredRelease.missing.length
        ? `missing required assets: ${requiredRelease.missing.join(', ')}`
        : 'draft and prerelease entries are not publishable'
      throw new Error(`Release "${requireTag}" is invalid: ${reason}`)
    }
  }

  const validReleases = inspected
    .filter((item) => item.valid)
    .sort(
      (left, right) =>
        right.uploadedAt.localeCompare(left.uploadedAt) ||
        right.release.tag_name.localeCompare(left.release.tag_name),
    )

  if (validReleases.length === 0) {
    throw new Error('No complete Release contains all three required ZIP files')
  }

  const versionByTag = new Map()
  const dateCounts = new Map()

  for (const item of [...validReleases].reverse()) {
    const sequence = (dateCounts.get(item.date) ?? 0) + 1
    dateCounts.set(item.date, sequence)
    const baseVersion = item.date.replaceAll('-', '.')
    versionByTag.set(
      item.release.tag_name,
      sequence === 1 ? baseVersion : `${baseVersion}.${sequence}`,
    )
  }

  const tools = Object.fromEntries(
    Object.entries(requiredAssets).map(([toolId, assetName]) => [
      toolId,
      validReleases.map((item, index) => {
        const asset = item.assets.get(assetName)

        return {
          version: versionByTag.get(item.release.tag_name),
          date: item.date,
          sizeBytes: asset.size,
          downloadUrl: asset.browser_download_url,
          isLatest: index === 0,
          sourceTag: item.release.tag_name,
        }
      }),
    ]),
  )

  return {
    generatedAt: validReleases[0].uploadedAt,
    tools,
  }
}

async function main() {
  const options = readArguments(process.argv.slice(2))
  const releases = options.input
    ? JSON.parse(await readFile(resolve(options.input), 'utf8'))
    : await fetchReleases()
  const manifest = buildManifest(releases, options['require-tag'])
  const outputPath = resolve(
    options.output || 'src/data/downloadHistory.generated.json',
  )

  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  process.stdout.write(
    `Generated ${outputPath} from ${manifest.tools['ck-rig-box'].length} complete release(s).\n`,
  )
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
})
