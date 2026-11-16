import { marked } from 'marked';
export function renderHelp(body, base, language) {
  const prefix = `${base}${language === 'en-US' ? 'en/' : ''}help/`;
  return marked.parse(body.replace(/\]\((?:\/help\/)?#\/?([\w-]+)\/([\w-]+)\)/g, `](${prefix}$1/$2/)`).replace(/\]\(\/tools\/wechat\/\)/g, `](${prefix}publish/wechat/)`).replace(/\]\(\/#([^)]*)\)/g, `](${base}${language === 'en-US' ? 'en/' : ''}#$1)`));
}
export function helpEntries(data) {
  return Object.entries(data.sections).flatMap(([section, content]) => Object.entries(content.docs).map(([doc, value]) => ({section, doc, ...value})));
}
