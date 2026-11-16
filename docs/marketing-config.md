# 营销配置

购买信息和下载地址各使用一个 JSON 文件，编辑后重新构建或推送发布即可更新页面。

文件请保存为 UTF-8。JSON 不支持注释，最后一个字段后不能添加逗号。

## 购买信息：src/data/purchase.json

- `url`：购买按钮的地址，可填商店链接或 `mailto:` 邮件地址。
- `price`：页面直接显示的价格文字，例如 `¥199`；空字符串表示不显示价格。示例金额仅演示格式。
- `description`：中文和英文的购买说明。
- `buttonLabel`：中文和英文的按钮文字。

当前配置从 fastcodeai.xyz 的公开门户接口导入：价格 ¥129，购买按钮使用原站提供的淘宝链接。购买说明同步自原站，修改价格或地址时可同时修改说明与按钮文字。

## 下载信息：src/data/downloads.json

- `autoSync`：默认 `false`，保留你手动编辑的安装包地址；设为 `true` 后，自动同步会替换 `version`、`date` 和 `assets`。
- `version`、`date`：下载区显示的版本和发布日期，可留空。
- `fallbackUrl`：某平台未配置安装包时显示的发布页地址。
- `channels`：官方发布渠道的名称与地址，下载区和页脚共用。
- `assets`：安装包清单，每项包含 `platform`、`name`、`url`。

`platform` 只能使用 `windows`、`macos`、`linux`、`android`。同一平台可添加多项，例如安装版、便携版或不同芯片架构。数组中每个平台的第一项用于系统图标的直接下载，其余选项放在「全部版本」下拉中。

当前配置从 fastcodeai.xyz 的公开下载接口导入正式版本 0.4.6。仅保留接口实际提供的 GitHub/Gitee 下载地址，没有通过拼接生成未经确认的镜像地址。

安装包配置格式示例（替换为真实地址后再使用）：

```json
{
  "platform": "windows",
  "name": "Windows 安装版 · x64",
  "url": "https://example.com/downloads/installer.exe"
}
```

将这些对象填入 `assets` 数组即可。启用自动同步时，GitHub Actions 使用工作流 token 获取正式 Release；手动模式不需要 token，也不访问 VPS。
