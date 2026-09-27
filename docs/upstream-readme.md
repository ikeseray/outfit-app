# Outfit App：家庭空间与智能衣柜

这是一个可在浏览器运行的 Expo Web 项目：管理家庭、房间网格和物品位置，并在卧室中打开智能衣柜或智能衣帽间。智能衣柜支持图片上传、DeepSeek 视觉识别、颜色/类别/材质/季节整理、衣物搜索、当前位置天气和当天穿搭建议。改造示例图片位于 `assets/wardrobe-remake/`。

## 快速启动

需要 Node.js 20+、pnpm（或 Node.js 自带的 Corepack）和 Python 3.11+。克隆仓库后，在项目根目录运行一次安装脚本，它会安装前端和本地视觉服务依赖，并创建 `.env` 模板：

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

接着按 [DeepSeek API key 配置说明](docs/deepseek-api-key.md) 填好自己的 key。然后在一个 PowerShell 窗口启动本地视觉服务（图片识别和 AI 当日建议需要它）：

```powershell
cd .\wardrobe_local_tool
powershell -ExecutionPolicy Bypass -File .\setup.ps1
Copy-Item .env.example .env
# 编辑 .env，填入你自己的 DeepSeek API key
powershell -ExecutionPolicy Bypass -File .\start_web.ps1
```

再开一个 PowerShell 窗口启动网页：

```powershell
pnpm web -- --port 8091
```

也可以在已完成配置后用一个脚本同时打开两个服务窗口：

```powershell
powershell -ExecutionPolicy Bypass -File .\start-all.ps1
```

浏览器打开 <http://localhost:8091/>。前端默认请求 `http://localhost:8000`；如暂时不启动后端，仍可使用房间布局、手动录入和本地搜索，视觉识别与天气/DeepSeek 功能会显示备用提示。

## 后端说明

`wardrobe_local_tool/` 是独立的本地 FastAPI 服务：使用 rembg 的 BiRefNet 模型在本机抠出衣物主体，再把透明图发送给配置的 DeepSeek 视觉模型，结果写入本地 SQLite。上传文件、抠图和数据库都只保存在本机，并通过 `.gitignore` 排除。完整批处理方式见 [wardrobe_local_tool/README.md](wardrobe_local_tool/README.md)。

API 端点：

- `POST /api/analyze`：上传一张衣物图片并识别
- `POST /api/chat`：根据衣柜和当天气象生成建议
- `GET /api/weather`：按浏览器定位获取天气
- `GET /api/items`：读取本地已识别衣物

请勿把真实 API key 写入前端、提交到 Git 或放进截图；只填写 `wardrobe_local_tool/.env`。`.env.example` 仅是配置模板。

DeepSeek key 的创建、视觉模型选择、401 排查和 Windows 配置步骤见 [docs/deepseek-api-key.md](docs/deepseek-api-key.md)。每台电脑都要使用自己的 key；项目不会内置或共享任何 key。

## 验证

```powershell
pnpm typecheck
pnpm test
git diff --check
```

浏览器自动化测试还需要额外安装 Playwright Chromium：

```powershell
pnpm exec playwright install chromium
pnpm test:ui
```

## GitHub 发布

仓库已提供 `.gitignore`，会排除 `node_modules`、Expo 缓存、Python 虚拟环境、`.env`、SQLite 数据库、上传图片和抠图输出。上传源码前确认这些本地文件没有被手动强制加入 Git。

## 穿搭展示预览
开发模式运行 npm run web -- --port 8096 后，打开 http://localhost:8096/?outfit-preview=1 可体验独立示例衣柜；首页仍在 http://localhost:8096/。真实衣柜内已接入同一 OutfitStudio 组件。
支持分开放置的穿搭画布、单品选中上浮、贴身淡光、玻璃换装浮层、同类直接替换/候选挑选、浏览器本地保存和 AI 失败时本地搭配。AI 返回需为 title、reason、itemIds 组成的 JSON；非法 ID 或不完整返回会回退并提示。示例数据不会进入家庭快照。
额外浏览器验证：启动 8096 端口后运行 node tests/outfit-browser.cjs（使用本机 Edge）。
衣物旁的玻璃胶囊支持直接轮换同类单品，网格按钮展开贴身候选。动画使用 Reanimated，Web 浮层使用 Floating UI；系统减少动态效果设置会关闭弹跳。原生端使用半透明表面兼容。
录屏：运行 node tests/record-outfit.cjs，视频输出到 test-results/outfit-glass-demo.webm。内置提示词位于 `src/outfit-studio.tsx`（穿搭结构化推荐）和 `wardrobe_local_tool/vision_api.py`、`wardrobe_local_tool/app.py`（衣物识别与建议）。
