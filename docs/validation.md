# 本地验收记录

静态门户已通过本地构建、类型检查、路由与资源检查，可在本机预览。

验收日期：2026-11-16。

- Astro 静态构建生成 103 个页面。
- `npm run check`：0 errors、0 warnings。
- `npm test`：8 项通过，覆盖安装包识别、双语帮助结构、Pages 路径、文案编码、配置地址及 SEO 元数据生成。
- `/website/` 项目路径与 `/` 域名根路径下，所有生成 HTML 的本地资源和链接检查通过。
- 本地首页、英文首页、帮助首页、AI 配置深链和产品截图均返回 HTTP 200。
- `npm audit`：0 vulnerabilities。
- `npm run check:seo`：103 页元数据与结构化数据、100 个站点地图 URL 检查通过；GitHub 项目路径与自定义域名根路径均通过。

本地预览：`http://127.0.0.1:4321/website/`。服务停止后运行 `npm run preview -- --host 127.0.0.1 --port 4321`。

GitHub Actions 工作流已编写，但尚未在远程运行；正式 Release 获取、GitHub Pages 发布、域名证书与 Cloudflare 缓存命中未做线上验证。按用户要求，新门户仅提供产品营销内容，旧 web 项目完整保留，在线工具和登录不迁移。
