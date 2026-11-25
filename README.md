# 大懒猫写作 · 官方网站

**简体中文** | [English](README.en.md)

> 本地优先的 AI 写作软件 —— 选题、思考、沉淀、分享，让每个灵感都长成作品。

这里是 [大懒猫写作（BigLazyCat Writer）](https://biglazycatwriter.top/)的官方门户仓库。官网是品牌的线上名片：介绍产品、提供下载与购买入口、展示官方插件与在线工具，并收录中英文使用帮助。

## 认识大懒猫写作

大懒猫写作面向长篇小说、公众号与内容创作者，把写作、资料研究、AI 辅助、思维导图、画布、排版导出和发布放进同一个工作台。桌面端覆盖 Windows / macOS / Linux，移动端提供 Android 版本。

- **本地优先**：一篇内容就是一个标准 Markdown 文件，合集是普通文件夹，导图是 `.xmind`，画布是 `.canvas`。任何编辑器都能打开，任何网盘或 Git 都能备份，作品始终属于你。
- **AI 优先，不绑模型**：可接入主流模型服务、OpenAI 兼容接口，或调用本机的 Claude / Codex；内置 MCP，让 AI 帮你建文件、理大纲、排版发布。
- **一次买断**：桌面版没有订阅和版本分级，30 天全功能试用，购买后所有功能与后续更新都归你。
- **开放生态**：官方插件提供公众号排版、书籍级排版导出、OCR 与语音等能力；也能按自己的流程定制插件。

## 官网里有什么

| 你想做的事 | 去哪里 |
| --- | --- |
| 了解产品与功能特色 | [首页](https://biglazycatwriter.top/) |
| 下载桌面版 / 移动版 | [下载页](https://biglazycatwriter.top/download/) · [GitHub 发布列表](https://github.com/biglazycat-writer/biglazycat-release/releases) · [Gitee 发布列表](https://gitee.com/biglazycatwriter/blc-release/releases) |
| 查看授权与购买 | [购买页](https://biglazycatwriter.top/pricing/) |
| 浏览官方插件 | [插件目录](https://biglazycatwriter.top/plugins/) |
| 阅读使用帮助与更新记录 | [帮助中心](https://biglazycatwriter.top/help/) |
| 查找常见疑问 | [常见问题](https://biglazycatwriter.top/faq/) |
| 联系我们 | biglazycatwriter@163.com |

官网还提供公众号排版、在线 PPT、结构化画布、思维导图和 PDF 阅读等在线工具，打开浏览器即可体验。

## 官方项目

| 项目 | 说明 |
| --- | --- |
| [biglazycat-release](https://github.com/biglazycat-writer/biglazycat-release) | 桌面版与移动版安装包、历史版本与更新清单 |
| [blc-export-book](https://github.com/biglazycat-writer/blc-export-book) | 排版导出：文章与文件夹生成 PDF / Word / EPUB / HTML / PNG |
| [blc-plugin-publish](https://github.com/biglazycat-writer/blc-plugin-publish) | 微信公众号排版与草稿发布 |
| [blc-plugin-sdk](https://github.com/biglazycat-writer/blc-plugin-sdk) | 官方插件 SDK |
| [blc-plugin-template](https://github.com/biglazycat-writer/blc-plugin-template) | 插件模板工程 |

品牌与产品信息以官网为准；下载只认 GitHub / Gitee 官方发布列表和官网提供的地址。

## 客户端更新地址

桌面端把下面这两个地址作为首选更新源（清单由发布仓库签名生成，本站只做只读镜像）：

- 正式渠道：<https://biglazycatwriter.top/updates/stable.json>
- 测试渠道：<https://biglazycatwriter.top/updates/beta.json>

`npm run sync:updates` 在构建前从发布仓库拉取各平台清单写入 `public/updates/`（不入库），
Pages 工作流已包含该步骤，新版本发布后重新构建一次即可生效，无需改动站点代码。
GitHub 或 Gitee 不可达时客户端会自动切换，因此镜像滞后不会阻塞发版。
