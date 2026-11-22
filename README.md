# 大懒猫写作门户

大懒猫写作的独立静态门户，提供产品介绍、客户端下载、主题展示与中英文使用帮助。

使用 Astro 构建，GitHub Pages 托管，Cloudflare 为自定义域名提供缓存加速。页面运行不依赖 VPS。

## 本地预览

1. 安装 Node.js 22.23.4 或更高版本，运行 `npm ci`。
2. 运行 `npm run dev`，打开终端显示的地址。
3. 运行 `npm test`、`npm run check`、`npm run build` 检查发布内容；`npm run preview` 预览构建产物。

默认路径是 `/website/`，对应 `https://biglazycat-writer.github.io/website/`。在自定义域名下开发或构建，设置 `SITE_URL=https://biglazycatwriter.top`、`BASE_PATH=/`。

## 发布

GitHub 仓库 Settings → Pages → Source 选择 **GitHub Actions**，推送 `main` 后自动部署。工作流每天重新构建，也可以手动执行。

购买配置在 `src/data/purchase.json`，下载配置在 `src/data/downloads.json`，修改后重新构建或推送发布即可生效，字段说明见[营销配置指南](docs/marketing-config.md)。

下载默认手动配置，不访问 GitHub API。将下载配置的 `autoSync` 改为 `true` 后，构建流程才会从正式 Release 更新版本与安装包清单；获取失败时工作流失败，保留上一版站点。

接入域名与缓存的步骤见 [部署指南](docs/deployment.md)，迁移边界与实施计划见 [实施计划](docs/implementation-plan.md)。

插件展示与桌面端商店共用 `src/data/plugins.json`；更新版本、配置多个下载来源和构建官网镜像见 [插件目录指南](docs/plugin-catalog.md)。构建前自动下载并校验插件镜像，也可单独运行 `npm run prepare:plugins`。

标题与搜索描述在 `src/data/seo.json`，页面自动生成结构化数据、双语链接、站点地图和 robots.txt；上线后的收录步骤见 [SEO 指南](docs/seo.md)。
