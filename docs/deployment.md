# 门户部署指南

门户通过 GitHub Actions 自动构建并发布到 GitHub Pages，自定义域名由 Cloudflare 代理。

## 首次发布

1. 在 `biglazycat-writer/website` 的 Settings → Pages 选择 **GitHub Actions**。
2. 推送主分支，或在 Actions 手动运行 **Deploy Astro to GitHub Pages**。
3. 等待部署任务成功，打开 `https://biglazycat-writer.github.io/website/`。

工作流通过 `actions/configure-pages` 的输出自动设置站点地址和路径，首次项目路径与后续自定义域名共用同一配置。每日 02:17 UTC 重新构建；仅在 downloads.json 的 autoSync 为 true 时更新下载列表。

## 域名与 HTTPS

1. 在 Cloudflare 添加 `biglazycatwriter.top`，在域名注册商将 NS 改为 Cloudflare 指定的两条记录。
2. 在 GitHub 账号或组织的 Pages 设置添加并验证域名，按 GitHub 提示设置 `_github-pages-challenge-*` TXT。先验证再绑定，避免域名被其他仓库占用。
3. Cloudflare DNS 添加 `CNAME @ → biglazycat-writer.github.io` 和 `CNAME www → biglazycat-writer.github.io`，初期均使用 **DNS only**。Cloudflare 为根域 CNAME 提供 flattening；目标不带 `https://` 或 `/website`。
4. 仓库 Settings → Pages → Custom domain 填 `biglazycatwriter.top` 并保存。等待 DNS 检查及 GitHub 证书完成，启用 **Enforce HTTPS**。
5. 手动重新运行 Pages 工作流，确保新的构建使用根路径 `/`。分别验证首页、帮助深链、截图和下载。
6. 将 Cloudflare DNS 切换为 **Proxied**，SSL/TLS 选择 **Full (strict)**，启用 Always Use HTTPS。不要使用 Flexible。

Actions 上传的静态产物不需要手动写 CNAME 文件；自定义域名以仓库 Pages 设置为准。证书尚未签发时保持 DNS only，签发后再启用代理。

## 缓存

Cloudflare 默认缓存常见静态文件，HTML 需要额外 Cache Rule。

| 匹配条件 | 缓存策略 |
| --- | --- |
| 域名为 biglazycatwriter.top 且路径以 `/_astro/` 开头 | Edge TTL 30 天；Browser TTL 1 年；文件名带内容哈希 |
| `/portal/` 中的截图和主题图片 | Edge TTL 1 天；Browser TTL 1 小时；更新相同文件名后 purge |
| 门户的 HTML 与帮助页面 | Cache eligible，Edge TTL 1 小时；Browser TTL 尊重源站 |

只为此静态域名设置规则，不把其他授权服务域名纳入。购买邮件链接和 GitHub/Gitee 安装包不通过此门户代理；Pages 的缓存加速不等于安装包下载加速。

新部署后，如果必须立即显示新 HTML，在 Cloudflare 按 URL 或 purge everything 清理缓存。先不依赖额外 API Token；有自动清理需要时，再配置仅限本 zone 的 cache purge token 到 Actions secrets。

## 验证

检查 `https://biglazycatwriter.top` 的证书、首页资源、帮助深链和 404 页面；请求同一截图两次，确认响应包含 `CF-Cache-Status: HIT` 或符合所设规则。

DNS 和证书签发可能需要等待。部署记录、工作流成功和实际 HTTP 页面均确认后，才算上线完成。
