# 官网统计

编辑 `src/data/analytics.json` 后重新部署：

- `cloudflareToken`：Cloudflare Web Analytics 提供的站点 token。若已经开启 Cloudflare 自动注入，保持为空，避免重复统计。
- `ga4MeasurementId`：GA4 数据流的 `G-…` 衡量 ID。

默认不加载第三方统计。配置 GA4 后，购买入口发送 `purchase_click`，具体安装包入口发送 `download_click`，包含平台、安装包名称与当前页面路径，不发送授权码、API Key 或文档内容。Cloudflare 基础访问统计与这些 GA4 自定义事件是独立的。

点击事件不代表购买成功或下载完成。可在 GA4 实时报告中验证事件，再按需要设置关键事件。启用统计前，应按实际采用的工具补充隐私说明与适用的同意机制。

所有点击同时发出浏览器本地 `portal:conversion` 自定义事件，便于调试或以后接入其他统计平台；没有配置统计平台时，这些事件不会上传保存。
