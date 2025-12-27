# Next.js 前端项目模板

这是一个前端项目模板，用于快速创建前端项目。

## 技术栈

- **Next.js 16** - React 框架
- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **React 19** - UI 库
- **TypeScript 5** - 类型安全的 JavaScript
- **Shadcn UI** - 高质量组件库
- **Lucid React** - 图标库
- **SWR** - 数据获取库
- **Zod** - TypeScript 优先的模式验证
- **Zustand** - 轻量级状态管理
- **Next-Intl** - 国际化解决方案
- **pnpm** - 包管理器
- **src 目录** - 项目源码目录

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 项目结构

```
├── src/
│   ├── app/              # Next.js App Router 页面
│   │   ├── [locale]/     # 国际化路由
│   │   └── globals.css   # 全局样式
│   ├── components/        # React 组件
│   │   └── ui/           # Shadcn UI 组件
│   ├── lib/              # 工具函数和配置
│   │   ├── api.ts        # SWR API 封装
│   │   └── schemas/      # Zod 验证模式
│   ├── store/            # Zustand 状态管理
│   ├── i18n/             # 国际化配置
│   └── middleware.ts     # Next.js 中间件
├── messages/             # 国际化消息文件
│   ├── zh.json          # 中文
│   └── en.json          # 英文
└── components.json       # Shadcn UI 配置

```

## 功能特性

- ✅ Next.js 16 App Router
- ✅ TypeScript 类型安全
- ✅ Tailwind CSS 样式
- ✅ Shadcn UI 组件库
- ✅ 国际化支持（中文/英文）
- ✅ 状态管理（Zustand）
- ✅ 数据获取（SWR）
- ✅ 表单验证（Zod）
- ✅ 图标库（Lucid React）

## 使用示例

### 添加 Shadcn UI 组件

```bash
pnpm dlx shadcn@latest add [component-name]
```

### 使用 Zustand Store

查看 `src/store/example-store.ts` 了解如何使用状态管理。

### 使用 SWR 获取数据

查看 `src/lib/api.ts` 了解如何使用 SWR 进行数据获取。

### 使用 Zod 验证

查看 `src/lib/schemas/example.ts` 了解如何定义验证模式。

### 添加新的国际化语言

1. 在 `messages/` 目录下添加新的语言文件（如 `ja.json`）
2. 在 `src/i18n/routing.ts` 中添加新的语言代码

## 许可证

ISC