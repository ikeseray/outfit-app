# Outfit App

Expo + React Native + TypeScript + Expo Router 基础项目。

当前只有首页、衣橱、AI穿搭、收藏、我的五个占位页面。

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
- `app/(tabs)/_layout.tsx`：五个底部导航标签
- `app/(tabs)/*.tsx`：各页面
- `components/placeholder-page.tsx`：共用占位内容
- `app.json`：应用名称、路由等配置
- `tsconfig.json`：TypeScript 配置

尚未接入登录、数据库、AI API 或图片上传。
