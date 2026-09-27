# Outfit App · 团队交付版

此版本以 hcduw/Item-Storage 的 08c9c39 为基础，整合穿搭展示分支 01b4d5e 和 D:/outfit-app 中的衣物素材、八种风格提示词及历史模块。当前默认展示为**单品分开放置**，已撤回人体叠放实验。

## 直接运行最新成果

需要 Node.js 20+。在仓库根目录执行：

```powershell
npm ci
npm run web -- --port 8096
```

- 完整应用：http://localhost:8096/
- 带图片的交互演示：http://localhost:8096/?outfit-preview=1 （仅开发模式；无需 API key）
- 示例演示与真实衣柜分开，不会自动导入个人衣物。

## 本次包含什么

| 内容 | 位置 |
| --- | --- |
| 最新衣物展示、弹起柔光、玻璃换装、直接轮换和候选选择 | src/outfit-studio.tsx 与 src/outfit-*.tsx |
| 真实衣物 ID 校验及本地推荐 | src/outfit-plan.ts |
| 内置的结构化穿搭提示词 | src/outfit-studio.tsx 中的 message |
| 8 种风格的完整基础规则和提示词构建函数 | reference/src/config/outfitPrompts.ts |
| 图片识别提示词与后端系统提示词 | wardrobe_local_tool/vision_api.py、wardrobe_local_tool/app.py |
| 20 张透明衣物素材 | assets/wardrobe/ |
| 演示页面实际使用的 8 张素材 | assets/outfit-demo/ |
| 20 张素材对应的完整生成提示词 | reference/tmp/imagegen/prompts.jsonl |
| 旧 Expo Router 应用、最新未提交模块和 HTTP 推荐服务 | archive/legacy-outfit/ |
| 素材总览与历史随机穿搭示例 | docs/media/ |

八种风格提示词是保留的可复用成果，目前**没有接入根目录新应用的风格选择 UI**。不要把归档目录作为新应用入口；它保留旧模块原状，不保证能单独安装运行。家庭收纳、天气、识别服务都包含在根目录新应用内。

## 真实衣柜的 AI 与图片服务

参考 [本地服务说明](wardrobe_local_tool/README.md) 和 [API 配置](docs/deepseek-api-key.md)，启动 FastAPI 服务。每位队友在自己的电脑配置 key；仓库不包含个人 .env、数据库和上传照片。
前端目前请求 http://localhost:8000。手机里的 localhost 指手机自己，因此真实图片/识别/天气服务尚需另行配置局域网地址。Expo Go 从应用首页进入，不会自动显示 Web 示例衣柜。Web 是本版已验证环境，未完成 iOS/Android 真机全流程验收。

## 验证

```powershell
npm run typecheck
npm test
# 先启动 8096 端口；下项测试默认使用本机 Microsoft Edge
node tests/outfit-browser.cjs
# 录制预览（首次运行需 npx playwright install ffmpeg）
node tests/record-outfit.cjs
```

交付前类型检查、29 项单元测试，以及分开展示/直接换装/候选挑选/保存/三种屏宽/键盘和减少动态效果/AI 失败恢复浏览器验证通过。
当前柔光为图片背后的淡光，不是精确的 alpha 轮廓描边；大标题滚动收缩也尚未实现，未把这些实验要求标记为完成。

## 版本和恢复

根目录替换旧应用，旧代码既保留在 Git 历史，也归档于 archive/legacy-outfit。独立的 jianzhi-app 健身项目、依赖、缓存、临时文件和本地凭据不属于本穿搭应用交付内容。
