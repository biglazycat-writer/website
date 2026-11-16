/**
 * 主题模型（与桌面端同源的一份拷贝，web 侧去掉了公众号结构版式相关字段）。
 *
 * 编辑器用主题渲染正文。主题文件是纯 CSS，**不带根前缀** —— 注入时由
 * `scopeThemeCss` 按目标补（富文本补 `.ProseMirror`，Markdown 预览补
 * `[data-markdown-preview]`）。
 *
 * 编写约定（保证同一份 CSS 与桌面端行为一致）：
 *
 *  1. 用**裸标签**选择器（p / h1 / h2 / blockquote / ul / ol / pre / code / table / img / hr / a）。
 *  2. 需要「块」语义时用 `pm-*` 类名（`.pm-block` `.pm-heading-1..6` 等）。
 *  3. **不要写 `.pm-heading-1 h1` 这种后代选择器** —— 编辑器里带类名的元素就是 h1 本身，
 *     没有内部 h1，这类规则在编辑器里永远不命中。
 *  4. 不要用 CSS 变量、`@media`、`@keyframes`、`position: fixed|absolute|sticky`、
 *     `float`、`display: grid` —— 桌面端公众号导出侧会丢弃这些语法，主题会在
 *     「编辑器好看、发出去变形」之间产生落差。
 *
 * 深色版（可选）：主题文件里写一个内容为 `@dark` 的注释，之后的所有规则就是黑夜模式
 * 专用的颜色覆盖。没写这段的主题在黑夜模式下不套深色，而是把纸张钉回浅色
 * （见 `LIGHT_PAPER_PIN`）—— 浅色版面在深色外壳里仍然自洽，也不会出现「深底深字」。
 */

export type ThemeFile = {
  /** 同时是主题文件夹名。 */
  id: string
  css: string
  builtin: boolean
}

export type EditorThemePreview = {
  accent: string
  bg: string
  /** 渐变或装饰用的第二色。 */
  accentSecondary?: string
}

/**
 * 主题的正文排版节奏（与桌面端同源）：行高是倍数，字间距与段间距是 em。
 * 值从主题 CSS 的正文规则里读出来（见 `readThemeRhythm`），它**不参与导出** ——
 * 公众号导出直接用主题 CSS 自己的值（发布面板另有一套滑杆）。
 */
export type ThemeRhythm = {
  lineHeight: number
  letterSpacing: number
  paragraphSpacing: number
}

/** 主题没写正文排版、或者根本没套主题时的节奏。 */
export const DEFAULT_THEME_RHYTHM: ThemeRhythm = {
  lineHeight: 1.85,
  letterSpacing: 0,
  paragraphSpacing: 1,
}

export type EditorTheme = {
  id: string
  name: string
  description: string
  /** 主题选择器上显示的能力标签，如「杂志风」「衬线」。 */
  tags: string[]
  /** 不带根前缀的外观 CSS（`@dark` 之前的浅色部分）。 */
  css: string
  /**
   * 黑夜模式的颜色覆盖：主题文件里 `@dark` 标记之后的规则。
   *
   * 空 = 这套主题没有深色版。编辑器在黑夜模式下会退回 `LIGHT_PAPER_PIN`
   * （纸张钉回浅色），而不是硬把浅色规则反转成深色。
   */
  darkCss?: string
  /** 完整文件内容（元数据头 + 浅色段 + `@dark` 段）。测试夹具或内存构造的主题可以缺省。 */
  source?: string
  preview: EditorThemePreview
  /** 正文排版节奏，从 CSS 的正文规则里读出来。 */
  rhythm: ThemeRhythm
  builtin: boolean
}

/** 所有主题共享的排版底座，先于主题 CSS 注入。 */
export const BASE_THEME_CSS = `
/*
 * 只放排版属性。这里刻意**不含 max-width / margin / padding / box-sizing**：
 * 主题会同时注入编辑器和公众号导出两个作用域，而 750px 居中那一套是公众号容器的
 * 约束 —— 放进编辑器会把正文卡成一条窄栏，页面宽度（A4 / 标准 / 宽屏）就失效了。
 * 导出的容器宽度由 #nice-export 上的内联样式负责，不依赖这条规则。
 */
:root {
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", "WenQuanYi Micro Hei", sans-serif;
  color: #3e3e3e;
  line-height: 1.9;
  letter-spacing: 0.5px;
  word-break: break-all;
}

.pm-block {
  margin: 0.58em 0;
  box-sizing: border-box;
}
.pm-heading-1 { margin-top: 1.35em; margin-bottom: 0.95em; }
.pm-heading-2 { margin-top: 1.1em; margin-bottom: 0.7em; }
.pm-heading-3 { margin-top: 0.85em; margin-bottom: 0.55em; }
.pm-blockquote,
.pm-code-block,
.pm-table-block {
  margin-top: 1em;
  margin-bottom: 1em;
}

p {
  font-size: 16px;
  line-height: 1.9;
  letter-spacing: 0.5px;
  margin-top: 0.25em;
  margin-bottom: 0.6em;
  text-align: left;
  word-break: break-all;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.6;
  letter-spacing: 1px;
  margin-top: 1.2em;
  margin-bottom: 0.6em;
  text-align: center;
}
h2 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.6;
  letter-spacing: 0.8px;
  margin-top: 1em;
  margin-bottom: 0.5em;
  text-align: left;
}
h3 {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.6;
  letter-spacing: 0.6px;
  margin-top: 0.8em;
  margin-bottom: 0.4em;
  text-align: left;
}

blockquote {
  margin: 0.8em 0;
  padding: 0.6em 1em;
  border-left: 4px solid #d0d0d0;
  background: #f8f8f8;
  line-height: 1.8;
  border-radius: 0 4px 4px 0;
}
blockquote p {
  margin-top: 0;
  margin-bottom: 0.3em;
  font-size: 15px;
  color: #666666;
}
blockquote p:last-child { margin-bottom: 0; }

ul, ol {
  margin: 0.6em 0;
  padding-left: 1.8em;
  line-height: 1.9;
}
li {
  font-size: 16px;
  margin-bottom: 0.2em;
  letter-spacing: 0.5px;
}
li p { margin: 0; }

a {
  color: #576b95;
  border-bottom: 1px solid #576b95;
  text-decoration: none;
  word-break: break-all;
}

pre {
  margin: 1em 0;
  padding: 1em;
  background: #f8f8f8;
  border-radius: 5px;
  border: 1px solid #e8e8e8;
  font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", Menlo, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
pre code {
  font-family: inherit;
  font-size: inherit;
  background: none;
  padding: 0;
}
p code, li code {
  background: #f0f0f0;
  color: #c7254e;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", Menlo, Monaco, "Courier New", monospace;
  font-size: 0.9em;
  letter-spacing: 0;
}

.hljs-keyword { color: #708; }
.hljs-string { color: #a11; }
.hljs-number { color: #164; }
.hljs-comment { color: #8a8a8a; font-style: italic; }
.hljs-function { color: #05a; }
.hljs-title { color: #05a; }
.hljs-params { color: #3e3e3e; }
.hljs-built_in { color: #05a; }
.hljs-attr { color: #05a; }
.hljs-tag { color: #708; }
.hljs-name { color: #708; }
.hljs-selector-class { color: #05a; }
.hljs-selector-tag { color: #708; }
.hljs-literal { color: #164; }
.hljs-type { color: #05a; }
.hljs-meta { color: #8a8a8a; }

img {
  display: block;
  margin: 0.8em auto;
  max-width: 100%;
  border-radius: 4px;
}

hr {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 1.2em 0;
}

table {
  width: 100%;
  /* 表格默认 content-box：width: 100% 再加上主题给的边框会比容器宽 1~4px，
     公众号里会顶出一截横向滚动。边框算进宽度对任何主题都更稳。 */
  box-sizing: border-box;
  border-collapse: collapse;
  margin: 0.8em 0;
  font-size: 14px;
  line-height: 1.7;
}
table th, table td {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  text-align: left;
  vertical-align: top;
  word-break: break-word;
}
table th {
  background: #f5f5f5;
  font-weight: 600;
}

strong { font-weight: 700; letter-spacing: 0.5px; }
em { font-style: italic; }
del { text-decoration: line-through; }
`.trim()

/**
 * 排版底座的深色版。只重写 `BASE_THEME_CSS` 里**带颜色**的规则，不碰任何排版属性。
 *
 * 位置在主题自带的浅色规则**之后**、主题的 `@dark` 段**之前**：底座的颜色（正文色、
 * 引用卡、行内代码、代码块、表格、hljs）是所有主题共用的，集中在这里深色化一次，
 * 各主题的 `@dark` 段就只需要处理它自己声明的颜色。同时也是漏项的安全网 —— 主题的
 * `@dark` 段忘了某个选择器时，落到的至少是深色默认值，而不是浅色。
 *
 * 只在主题确实带 `@dark` 段时才注入。没有深色版的主题走 `LIGHT_PAPER_PIN`，
 * 不会被这里的通用深色覆盖掉自己的浅色身份。
 *
 * 它只进编辑器，所以不受「禁用 CSS 变量」那条约束；这里仍然写死颜色，是为了让
 * 各主题的 `@dark` 段有一组稳定的基准值可以覆盖。
 */

export const DARK_BASE_THEME_CSS = `
:root {
  color: #D4D4D4;
  background-color: #1B1B1B;
}

blockquote {
  border-left-color: #4A4A4A;
  background: #202020;
}
blockquote p { color: #A3A3A3; }

a { color: #7FA7E0; border-bottom-color: #7FA7E0; }

pre {
  background: #151515;
  border-color: #333333;
}

p code, li code { background: #2A2A2A; color: #E58FA8; }

.hljs-keyword { color: #C678DD; }
.hljs-string { color: #98C379; }
.hljs-number { color: #D19A66; }
.hljs-comment { color: #6B7280; }
.hljs-function { color: #61AFEF; }
.hljs-title { color: #61AFEF; }
.hljs-params { color: #ABB2BF; }
.hljs-built_in { color: #E6C07B; }
.hljs-attr { color: #D19A66; }
.hljs-tag { color: #E06C75; }
.hljs-name { color: #E06C75; }
.hljs-selector-class { color: #61AFEF; }
.hljs-selector-tag { color: #C678DD; }
.hljs-literal { color: #D19A66; }
.hljs-type { color: #E6C07B; }
.hljs-meta { color: #6B7280; }

hr { border-top-color: #3A3A3A; }

table th, table td { border-color: #3A3A3A; }
table th { background: #242424; }
`.trim()

/**
 * 主题没有深色版时的黑夜模式兜底：把纸张钉回浅色。
 *
 * 为什么不是「自动反转成深色」：主题是为一篇浅色文章设计的，把它的颜色机械变暗会
 * 得到一套既不像原主题、也不像应用深色的东西（朱红印章会变成灰块）。把纸钉成浅色，
 * 主题的版面**原样成立**，只是坐在一张深色书桌上 —— 代价是夜里仍是一张亮纸，换来的是
 * 「绝不会出现深底深字」。
 *
 * 两个细节：
 *  1. 它是**原样注入**的（不经过 `scopeThemeCss` 的作用域化），因为它自带应用自己的
 *     选择器，不是主题作者的 CSS。
 *  2. 必须排在主题的根规则**之前**。主题自己的 `background` / `background-color`
 *     与它同深度，靠加载顺序取胜 —— 排在后面，主题的纸色才压得住这里的白。
 *
 * 只覆盖「被深色外壳变过、而主题管不到」的变量：`--editor-page-bg` 是纸张色，
 * `--content-text` 是正文色。`--color-primary` 故意不动 —— 链接色几乎每套主题都会
 * 自己声明，而应用主题色是产品身份，不该在这里被写死成某个具体色值。
 */
export const LIGHT_PAPER_PIN = `
.ProseMirror {
  --editor-page-bg: #FFFFFF;
  --editor-page-border: rgba(0, 0, 0, 0.08);
  --content-text: #1F2328;
  --text-primary: #111827;
  --text-tertiary: #4B5563;
  --text-faint: #9CA3AF;
  --border-subtle: rgba(0, 0, 0, 0.12);
  --border-strong: rgba(0, 0, 0, 0.26);
  background-color: #FFFFFF;
}

[data-markdown-preview] {
  --content-text: #1F2328;
  --text-primary: #111827;
  --text-tertiary: #4B5563;
  --text-faint: #9CA3AF;
  --border-subtle: rgba(0, 0, 0, 0.12);
  --border-strong: rgba(0, 0, 0, 0.26);
  background-color: #FFFFFF;
}
`.trim()
