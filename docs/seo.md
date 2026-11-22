# 搜索引擎收录

门户用可直接读取的产品介绍、软件元数据和双语帮助页面，让搜索引擎了解大懒猫写作的功能与下载方式。

## 已配置

- 首页中文与英文标题、描述及搜索词，说明本地优先、AI 写作、小说创作、Markdown 编辑与支持系统。
- 帮助页使用文章标题和首段摘要，每篇文档有可独立访问的 URL。
- canonical 与 hreflang 对应中文、英文页面；帮助目录首页指向正式介绍文档，避免重复收录。
- Open Graph 和 Twitter 分享卡片，提供产品截图、标题与摘要。
- WebSite、Organization、SoftwareApplication、FAQPage、TechArticle、BreadcrumbList 结构化数据。
- 软件报价读取 purchase.json；未提供评分、销量等未经证实的数据。
- sitemap.xml 收录首页及帮助文档，使用文档真实更新日期；404 标记 noindex。
- robots.txt 允许抓取，并提供站点地图地址。

文案与可选站点验证 token 在 `src/data/seo.json`。修改后重新构建发布。工作流自动检查生成的 SEO 数据。

## 上线后提交

1. 将 `biglazycatwriter.top` 正式接入 Pages 并重新部署，检查首页 canonical、`https://biglazycatwriter.top/robots.txt` 与 `https://biglazycatwriter.top/sitemap.xml`。
2. 在 [Google Search Console](https://search.google.com/search-console) 添加域名资源，按提示在 Cloudflare 添加所有权验证 TXT；提交 `sitemap.xml`，使用 URL 检查请求收录首页。
3. 在 [Bing Webmaster Tools](https://www.bing.com/webmasters) 验证网站并提交站点地图。
4. 在 [百度搜索资源平台](https://ziyuan.baidu.com/) 验证网站，使用账户当前提供的普通收录或站点地图功能提交地址。

使用 HTML meta 验证时，可将对应平台的 token 填入 seo.json 的 verification.google、verification.bing、verification.baidu。DNS 验证无需填写这些字段。验证信息必须使用搜索平台为你实际生成的值。

初次 GitHub 项目地址的站点地图位于 `/website/sitemap.xml`，切换自定义域名后变为 `/sitemap.xml`；不要把旧项目地址提交为正式域名地址。所有权验证与提交需要对应账户，本轮只准备本地代码和说明。

收录与排名由搜索引擎决定。结构化 FAQ 和软件信息有助于理解页面，不保证展示富媒体结果；持续更新真实帮助内容和正式发布信息，并通过相关项目、官方发布页与社区介绍链接到门户。
