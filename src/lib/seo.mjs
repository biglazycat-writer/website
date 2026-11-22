export function siteOrigin(value = 'https://biglazycat-writer.github.io') {
  return value.replace(/^http:/, 'https:');
}
export function pageUrls(site, base, pathname) {
  const prefix = base.replace(/\/$/, '');
  const path = pathname.slice(prefix.length).replace(/^\//, '');
  const neutral = path.replace(/^en\//, '');
  const absolute = value => new URL(`${prefix}/${value}`, site).href;
  return { canonical: new URL(pathname, site).href, zh: absolute(neutral), en: absolute(`en/${neutral}`) };
}
export function helpDescription(body) {
  return body.split(/\n\s*\n/)[0].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*`#]/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
}
export function softwareSchema({site,base,language,description,purchase,downloads}) {
  const root = new URL(base, site).href;
  const home = new URL(language === 'en-US' ? `${base}en/` : base, site).href;
  const price = /^¥\s*([\d,]+(?:\.\d+)?)$/.exec(purchase.price);
  return {
    '@type':'SoftwareApplication', '@id':`${root}#software`,
    name:language === 'en-US' ? 'BigLazyCat Writer' : '大懒猫写作',
    alternateName:language === 'en-US' ? '大懒猫写作' : 'BigLazyCat Writer',
    url:home, description, applicationCategory:'BusinessApplication',
    operatingSystem:'Windows, macOS, Linux, Android',
    image:new URL(`${base}logo.png`,site).href,
    screenshot:new URL(`${base}portal/screenshots/hero-desktop.webp`,site).href,
    softwareVersion:downloads.version || undefined,
    downloadUrl:downloads.fallbackUrl,
    publisher:{'@id':`${root}#organization`},
    ...(price ? {offers:{'@type':'Offer',price:price[1].replaceAll(',',''),priceCurrency:'CNY',url:purchase.url}} : {}),
  };
}
export function xmlEscape(value) { return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }
