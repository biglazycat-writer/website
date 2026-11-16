export function platformOf(name) {
  if (/\.apk$/i.test(name)) return 'android';
  if (/\.(exe|msi)$/i.test(name) || /windows.*\.zip$/i.test(name)) return 'windows';
  if (/\.(dmg|pkg)$/i.test(name) || /(?:macos|darwin).*\.zip$/i.test(name)) return 'macos';
  if (/\.(deb|rpm|appimage)$/i.test(name) || /linux.*\.(?:zip|tar\.gz)$/i.test(name)) return 'linux';
  return null;
}
export function releaseData(release) {
  if(release.draft || release.prerelease) throw Error('Only stable public releases can be published');
  return {version:release.tag_name,date:(release.published_at||'').slice(0,10),assets:(release.assets||[]).filter(asset=>platformOf(asset.name)).map(asset=>({name:asset.name,url:asset.browser_download_url,platform:platformOf(asset.name)}))};
}
