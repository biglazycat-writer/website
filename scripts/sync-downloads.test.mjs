import assert from 'node:assert/strict'
import test from 'node:test'
import { buildDownloads, toAsset } from './sync-downloads.mjs'

const feed = {
	version: '0.4.13',
	publishedAt: '2026-11-25T09:13:25.000Z',
	downloads: [
		{ platform: 'deb', arch: 'amd64', kind: 'deb', name: 'deb 安装包', url: 'https://api.example.com/0.4.13/app.deb', size: 10 },
		{ platform: 'linux', arch: 'amd64', kind: 'appimage', name: 'AppImage 版本', url: 'https://api.example.com/0.4.13/app.AppImage' },
		{ platform: 'windows', arch: 'amd64', kind: 'installer', name: '安装版本', url: 'https://api.example.com/0.4.13/app-setup.exe' },
		{ platform: 'darwin', arch: 'amd64', kind: 'dmg', name: 'Intel 版本', url: 'https://api.example.com/0.4.13/app-intel.dmg' },
		{ platform: 'darwin', arch: 'arm64', kind: 'dmg', name: 'Apple 芯片版本', url: 'https://api.example.com/0.4.13/app-arm64.dmg' },
		{ platform: 'android', arch: 'arm64', kind: 'apk', name: '安卓安装包', url: 'https://api.example.com/0.4.13/app.apk' },
	],
}

const current = {
	autoSync: false,
	dist: 'legacy',
	fallbackUrl: 'https://github.com/biglazycat-writer/biglazycat-release/releases/latest',
	channels: [{ name: 'GitHub', url: 'https://github.com/biglazycat-writer/biglazycat-release/releases' }],
	assets: [{ platform: 'windows', name: '旧条目', url: 'https://old.example.com/app.exe' }],
}

test('assets are grouped by site platform and ordered for the primary button', () => {
	const { assets } = buildDownloads(feed, current)
	assert.deepEqual(assets.map(a => `${a.platform}/${a.arch}`), [
		'windows/amd64',
		'macos/arm64',
		'macos/amd64',
		'linux/amd64',
		'linux/amd64',
		'android/arm64',
	])
	assert.deepEqual(assets.map(a => a.kind), ['installer', 'dmg', 'dmg', 'appimage', 'deb', 'apk'])
	// AppImage 排在 deb 前，作为 Linux 主按钮
	assert.match(assets[3].url, /AppImage$/)
})

test('release channels and fallback stay hand-configured, never taken from the feed', () => {
	const next = buildDownloads(feed, current)
	assert.equal(next.version, '0.4.13')
	assert.equal(next.date, '2026-11-25')
	assert.deepEqual(next.channels, current.channels)
	assert.equal(next.fallbackUrl, current.fallbackUrl)
	assert.equal(next.dist, 'legacy')
	assert.equal(next.autoSync, false)
})

test('duplicate and unusable entries are dropped', () => {
	const duplicate = {
		...feed,
		downloads: [
			{ platform: 'windows', arch: 'amd64', url: 'https://api.example.com/a.exe' },
			{ platform: 'windows', arch: 'amd64', url: 'https://api.example.com/b.exe' },
			{ platform: 'windows', arch: 'amd64', url: 'javascript:alert(1)' },
		],
	}
	const { assets } = buildDownloads(duplicate, current)
	assert.equal(assets.length, 1)
	assert.equal(assets[0].url, 'https://api.example.com/a.exe')
	assert.equal(assets[0].name, '安装版本')
	assert.equal(assets[0].source, 'self')
})

test('a feed without download links is rejected instead of shipping stale buttons', () => {
	assert.throws(() => buildDownloads({ version: '0.4.13', downloads: [] }, current), /downloads/)
	assert.throws(() => buildDownloads({ version: 'next', downloads: feed.downloads }, current), /版本号/)
	assert.equal(toAsset({ platform: 'solaris', arch: 'amd64', url: 'https://x/y' }), null)
})
