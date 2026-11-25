import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isUpdateManifest, updateFeedPaths } from './sync-updates.mjs'

const valid = {
  schemaVersion: 1,
  version: '0.4.12',
  channel: 'stable',
  artifacts: [{
    platform: 'windows', arch: 'amd64', url: 'https://example.com/part-001',
    filename: 'biglazycat-desktop-0.4.12-windows-amd64-update.zip', size: 1024,
    digestAlgo: 'sha256', digest: 'AAAA', signatureAlgo: 'ed25519', signature: 'BBBB',
  }],
  metadata: { parts: [{ url: 'https://example.com/part-001', size: 1024 }] },
}

test('update feeds cover every published platform and channel', () => {
  const paths = updateFeedPaths()
  for (const channel of ['stable', 'beta']) {
    for (const path of [
      `updates/${channel}.json`,
      `updates/linux/amd64/${channel}.json`,
      `updates/linux/arm64/${channel}.json`,
      `updates/linux/deb/amd64/${channel}.json`,
      `updates/linux/deb/arm64/${channel}.json`,
      `updates/darwin/universal/${channel}.json`,
    ]) assert.ok(paths.includes(path), path)
  }
  assert.equal(new Set(paths).size, paths.length)
})

test('only signed manifests with public https parts are mirrored', () => {
  assert.equal(isUpdateManifest(valid), true)
  assert.equal(isUpdateManifest({ ...valid, schemaVersion: 2 }), false)
  assert.equal(isUpdateManifest({ ...valid, channel: 'nightly' }), false)
  assert.equal(isUpdateManifest({ ...valid, version: '0.4' }), false)
  assert.equal(isUpdateManifest({ ...valid, artifacts: [] }), false)
  assert.equal(isUpdateManifest({ ...valid, artifacts: [{ ...valid.artifacts[0], signature: '' }] }), false)
  assert.equal(isUpdateManifest({ ...valid, artifacts: [{ ...valid.artifacts[0], url: 'http://example.com/part' }] }), false)
  assert.equal(isUpdateManifest({ ...valid, metadata: { parts: [] } }), false)
  assert.equal(isUpdateManifest({ ...valid, metadata: { parts: [{ url: 'http://example.com/part', size: 1 }] } }), false)
  assert.equal(isUpdateManifest(null), false)
})
