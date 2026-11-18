const version = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export function httpsUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash) throw Error(`Invalid HTTPS URL: ${value}`);
  return url;
}
export function validateCatalog(catalog) {
  if (catalog.schemaVersion !== 1 || !Number.isFinite(Date.parse(catalog.updatedAt)) || !Array.isArray(catalog.plugins)) throw Error('Invalid plugin catalog');
  const ids = new Set();
  for (const plugin of catalog.plugins) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(plugin.id) || ids.has(plugin.id)) throw Error('Invalid or duplicate plugin ID');
    ids.add(plugin.id);
    for (const key of ['name', 'nameEn', 'description', 'descriptionEn', 'author', 'category', 'icon']) if (!plugin[key]?.trim()) throw Error(`Missing ${key}: ${plugin.id}`);
    httpsUrl(plugin.homepage);
    if (!plugin.features?.length || !plugin.featuresEn?.length || !plugin.releases?.length) throw Error(`Missing plugin details: ${plugin.id}`);
    const versions = new Set();
    for (const release of plugin.releases) {
      if (!version.test(release.version) || versions.has(release.version) || !version.test(release.minimumClientVersion)) throw Error(`Invalid plugin version: ${plugin.id}`);
      versions.add(release.version);
      if (release.apiVersion !== 1 || !Number.isInteger(release.minimumApiRevision) || release.minimumApiRevision < 0 || !release.platforms?.length || !release.platforms.every(p => /^(windows|darwin|linux)\/(amd64|arm64)$/.test(p))) throw Error('Invalid compatibility metadata');
      if (!/^[a-f0-9]{64}$/.test(release.sha256) || !Number.isSafeInteger(release.size) || release.size < 1 || release.size > 128 * 1024 * 1024) throw Error(`Invalid package integrity: ${plugin.id}`);
      if (!release.downloads?.length) throw Error(`Missing downloads: ${plugin.id}`);
      const sources = new Set(), urls = new Set();
      for (const source of release.downloads) {
        if (!/^[a-z0-9-]+$/.test(source.id) || sources.has(source.id) || urls.has(source.url) || !source.name?.trim() || !source.nameEn?.trim()) throw Error('Invalid or duplicate download source');
        sources.add(source.id); urls.add(source.url); httpsUrl(source.url);
      }
    }
    plugin.releases.sort((a, b) => {
      const av=a.version.split('.').map(Number), bv=b.version.split('.').map(Number);
      return bv[0]-av[0] || bv[1]-av[1] || bv[2]-av[2];
    });
  }
  return catalog;
}
export const packageFilename = (plugin, release) => `${plugin.id}-${release.version}.tgz`;
export const packageSize = bytes => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
