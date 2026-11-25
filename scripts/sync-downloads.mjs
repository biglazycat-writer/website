// 用发版机生成的合并清单（public/update-feed/stable.json）驱动官网下载区：
// 「最新安装包」的地址一律取自清单的 downloads 段，指向自建下载服务器；
// 「发布渠道」「历史版本」不走清单，保留 downloads.json 里写死的 GitHub / Gitee 链接，
// 让用户想看全部历史版本时去发布页，而不是把官网当成一个下载站。
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const feedPath = resolve(root, 'public', 'update-feed', 'stable.json')
const dataPath = resolve(root, 'src', 'data', 'downloads.json')

// 清单用 Wails 的 GOOS 值（darwin / deb 是发布侧的分类），站点按 windows/macos/linux/android 分组。
const PLATFORM = {
	windows: 'windows',
	darwin: 'macos',
	macos: 'macos',
	linux: 'linux',
	deb: 'linux',
	android: 'android',
}
const PLATFORM_ORDER = ['windows', 'macos', 'linux', 'android']
// 同一平台有多条时，主按钮取第一条：AppImage 优先于 deb，Apple 芯片优先于 Intel。
const KIND_ORDER = ['installer', 'dmg', 'appimage', 'deb', 'apk']
const ARCH_ORDER = ['arm64', 'amd64', 'universal']
const FALLBACK_NAME = {
	windows: '安装版本',
	macos: '安装包',
	linux: '安装包',
	android: '安装包',
}

const rank = (list, value) => {
	const index = list.indexOf(value)
	return index === -1 ? list.length : index
}

export function toAsset(item) {
	const platform = PLATFORM[String(item.platform)]
	if (!platform) return null
	if (typeof item.url !== 'string' || !/^https?:\/\//i.test(item.url)) return null
	const arch = String(item.arch || '')
	return {
		platform,
		name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : FALLBACK_NAME[platform],
		url: item.url,
		kind: String(item.kind || 'installer'),
		arch,
		source: 'self',
		filename: typeof item.filename === 'string' ? item.filename : '',
		size: Number(item.size) || 0,
	}
}

// 纯函数：清单 + 现有配置 → 新的 downloads.json，保留渠道与兜底地址不动。
export function buildDownloads(feed, current = {}) {
	if (!feed || typeof feed !== 'object') throw new Error('更新清单不是有效的 JSON 对象')
	if (typeof feed.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(feed.version)) throw new Error('更新清单缺少有效版本号')
	if (!Array.isArray(feed.downloads) || feed.downloads.length === 0) throw new Error('更新清单没有 downloads 段')

	const seen = new Set()
	const assets = feed.downloads
		.map(toAsset)
		.filter(asset => asset && !seen.has(`${asset.platform}/${asset.arch}/${asset.kind}`) && seen.add(`${asset.platform}/${asset.arch}/${asset.kind}`))
		.sort((a, b) =>
			rank(PLATFORM_ORDER, a.platform) - rank(PLATFORM_ORDER, b.platform) ||
			rank(KIND_ORDER, a.kind) - rank(KIND_ORDER, b.kind) ||
			rank(ARCH_ORDER, a.arch) - rank(ARCH_ORDER, b.arch) ||
			a.name.localeCompare(b.name))

	if (assets.length === 0) throw new Error('更新清单的 downloads 段没有可用的安装包地址')

	const date = typeof feed.publishedAt === 'string' ? feed.publishedAt.slice(0, 10) : current.date
	return {
		...current,
		autoSync: false,
		version: feed.version,
		date,
		assets,
	}
}

function main() {
	if (!existsSync(feedPath)) {
		console.log(`未找到更新清单 ${feedPath}，保留现有 downloads.json`)
		return
	}
	let feed
	try {
		feed = JSON.parse(readFileSync(feedPath, 'utf8'))
	} catch (error) {
		throw new Error(`更新清单解析失败：${error.message}`)
	}
	const current = existsSync(dataPath) ? JSON.parse(readFileSync(dataPath, 'utf8')) : {}
	const next = buildDownloads(feed, current)
	writeFileSync(dataPath, JSON.stringify(next, null, 2) + '\n')
	console.log(`下载区已按清单更新：v${next.version} · ${next.assets.length} 个安装包（${next.assets.map(a => a.platform + '/' + a.arch).join('、')}）`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
	try {
		main()
	} catch (error) {
		console.error(error.message)
		process.exitCode = 1
	}
}
