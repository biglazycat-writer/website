// 把发布仓库里的更新清单镜像到官网，作为客户端的固定更新地址。
// 清单本身由发版机签名生成，这里只做只读搬运，不修改内容，也不会在本地缓存过期副本。
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = join(root, 'public/updates')
const sources = [
  'https://raw.githubusercontent.com/biglazycat-writer/biglazycat-release/main/',
  'https://gitee.com/biglazycatwriter/blc-release/raw/master/',
]

export function updateFeedPaths() {
  const paths = []
  for (const channel of ['stable', 'beta']) {
    paths.push(`updates/${channel}.json`)
    for (const arch of ['amd64', 'arm64']) {
      paths.push(`updates/linux/${arch}/${channel}.json`, `updates/linux/deb/${arch}/${channel}.json`)
    }
    paths.push(`updates/darwin/universal/${channel}.json`)
  }
  return paths
}

// 只接受与 updatefeed 包结构一致、且分段地址为公开 HTTPS 的清单，避免把 404 页面或错误内容发到线上。
export function isUpdateManifest(value) {
  const artifact = value?.artifacts?.[0]
  const parts = value?.metadata?.parts
  if (value?.schemaVersion !== 1) return false
  if (typeof value.version !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value.version)) return false
  if (value.channel !== 'stable' && value.channel !== 'beta') return false
  if (!Array.isArray(value.artifacts) || value.artifacts.length !== 1) return false
  if (typeof artifact.url !== 'string' || !artifact.url.startsWith('https://')) return false
  if (typeof artifact.filename !== 'string' || typeof artifact.platform !== 'string') return false
  if (typeof artifact.signature !== 'string' || artifact.signature === '') return false
  if (!Array.isArray(parts) || parts.length === 0 || parts.length > 32) return false
  return parts.every(part => typeof part?.url === 'string' && part.url.startsWith('https://') && part.size > 0)
}

async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: 'follow' })
  if (response.status === 404 || response.status === 204) return { missing: true }
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return { text: await response.text() }
}

async function readManifest(path) {
  const errors = []
  for (const source of sources) {
    try {
      const result = await fetchText(source + path)
      if (result.missing) return { missing: true }
      let parsed
      try {
        parsed = JSON.parse(result.text)
      } catch {
        throw new Error('invalid JSON')
      }
      if (!isUpdateManifest(parsed)) throw new Error('unexpected manifest')
      return { manifest: parsed }
    } catch (error) {
      errors.push(`${source.split('/')[2]}: ${error.message}`)
    }
  }
  return { errors }
}

async function main() {
  const written = []
  const missing = []
  const failed = []
  for (const path of updateFeedPaths()) {
    const result = await readManifest(path)
    if (result.missing) {
      missing.push(path)
      continue
    }
    if (result.errors) {
      failed.push(`${path} (${result.errors.join('; ')})`)
      continue
    }
    const file = join(outDir, path.replace(/^updates\//, ''))
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, JSON.stringify(result.manifest, null, 2) + '\n')
    written.push(`${path} → ${result.manifest.version}`)
  }
  console.log(`Mirrored ${written.length} update feeds to public/updates:`)
  for (const line of written) console.log(`  ${line}`)
  if (missing.length) console.log(`Not published yet (${missing.length}): ${missing.join(', ')}`)
  if (failed.length) {
    console.warn(`Failed to read ${failed.length} feed(s):`)
    for (const line of failed) console.warn(`  ${line}`)
    // 两个源都读不到且一份清单都没写成功，说明网络或仓库配置出了问题，让构建失败以便被发现。
    if (written.length === 0) process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
