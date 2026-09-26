# Outfit App

Expo + React Native + TypeScript + Expo Router 基础项目。

第一批迁移自 `D:\test` 的“智能衣柜”网页项目，旧项目保持原样。

底部导航为首页、搭配、设计、衣橱。首页保留原版天气、场景与穿搭卡片；搭配页可生成从今天起的七天模拟方案，并切换同类衣物。设计和衣橱暂为占位页。

目前数据仅在页面内存中保存，刷新会重置；天气、评分和搭配为模拟数据，不代表真实 AI 推荐。只有示例下装有两个候选，因此只有下装可“换一件”。收藏、风格与其他旧版页面不在本批迁移范围内。

## 启动

在项目目录打开 PowerShell：

```powershell
npm install
npm start
```

手机安装 Expo Go，与电脑连接同一个 Wi-Fi，扫描终端二维码。
Android 使用 Expo Go 扫码，iPhone 使用相机扫码。
如果提示 SDK 不兼容，需要使用支持本项目 Expo SDK 57 的 Expo Go。

网页预览：`npm run web`。类型检查：`npm run typecheck`。

## 目录

- `app/_layout.tsx`：应用导航入口
- `app/(tabs)/_layout.tsx`：四个底部导航标签
- `app/(tabs)/*.tsx`：各页面
- `components/wardrobe-ui.tsx`：旧版配色、卡片和按钮的原生组件
- `domain/types.ts`：复用旧版衣物、天气和搭配数据类型
- `services/`：复用旧版模拟服务，以及每周生成、替换单品逻辑
- `app.json`：应用名称、路由等配置
- `tsconfig.json`：TypeScript 配置

尚未接入登录、数据库、AI API 或图片上传。

## 团队协作基线

当前版本作为 `baseline/current-app` 交付基线，适合多人从此分支创建功能分支：

- `feature/home`：首页、天气卡片和场景入口
- `feature/wardrobe`：衣橱、衣物详情、收藏和衣物状态
- `feature/ai-outfit`：AI 穿搭推荐、结果详情、替换和评分

共享 UI 位于 `components/wardrobe-ui.tsx`，路由入口位于 `app/(tabs)/_layout.tsx`。修改共享文件前请先协调，避免多个分支同时改动同一热点文件。当前天气、评分、衣物和推荐仍使用 mock 数据。

### 给队友的启动步骤

```powershell
npm install
npm run typecheck
npm start
```

手机使用 Expo Go 扫描终端二维码，或运行 `npm run web` 查看网页预览。`outputs/` 中的 `migrated-home.png` 和 `migrated-weekly.png` 是当前页面参考图。
