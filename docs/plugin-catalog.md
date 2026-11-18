# 插件目录与下载来源

插件目录同时为官网展示页和大懒猫创作平台桌面端插件商店提供版本、介绍与安装包信息。

中文页面是 `/plugins/`，英文页面是 `/en/plugins/`；客户端通过 `/plugins/catalog.json` 获取同一份目录。源文件为 `src/data/plugins.json`。

## 上架或更新

1. 先在插件仓库创建正式 Release，上传 `.tgz` 和 SHA-256 文件。
2. 在目录中添加插件介绍和发布记录，填写实际包大小、SHA-256、最低客户端版本、API 要求与支持平台。
3. 在 `downloads` 中配置下载来源，每项包含唯一 `id`、中文 `name`、英文 `nameEn` 和 HTTPS `url`。
4. 运行 `npm test`、`npm run check`、`npm run build`，再按部署指南发布；构建会自动下载并校验镜像包，也可单独运行 `npm run prepare:plugins`。

官网与客户端均按版本号选取最新正式版本。每个版本的所有来源必须提供字节完全一致的安装包，共用该版本的大小和 SHA-256；不要让来源链接指向浮动的 latest 包。

## 多个下载来源

当前每个插件提供官网镜像和 GitHub。官网分别展示按钮；客户端可在安装前选择来源，下载失败后可切换来源重试。

`official` 来源固定使用 `https://biglazycatwriter.top/plugins/packages/<插件ID>-<版本>.tgz`。构建工作流从 `github` 来源下载，校验大小与 SHA-256 后复制到静态站点。包产物不提交到 Git；校验或下载失败会停止部署，保留已上线站点。

新增 Gitee、OSS 或其他来源时，先上传同一份包，再向 `downloads` 添加一项。删除不再可用的来源后重新部署即可。

## 客户端协议

目录使用 `schemaVersion: 1`，`updatedAt` 为 RFC 3339 时间；`plugins` 中每个插件有稳定 `id` 和 `releases` 数组。发布记录包含 `version`、`minimumClientVersion`、`apiVersion`、`minimumApiRevision`、`platforms`、`size`、`sha256` 和 `downloads`。

客户端缓存目录 5 分钟，可手动刷新；连接失败时展示磁盘缓存并提示。安装由客户端 Go 后端根据目录解析下载源，校验安装包大小、SHA-256、包内 ID 与版本，再执行现有插件安装流程。

Cloudflare 可为 `/plugins/catalog.json` 配置约 5 分钟缓存，为带固定版本的 `/plugins/packages/` 配置长期缓存。更新目录后如需立即生效，清理对应目录 URL 的缓存。
