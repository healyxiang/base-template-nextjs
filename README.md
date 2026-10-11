# LaunchKit · Next.js SaaS 模板

从 Baby Moment 抽取的通用基础系统：Next.js 16、React 19、Tailwind 4、next-intl、Supabase、Waffo、MDX。源项目没有修改。

## 快速开始

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

无外部服务配置时，首页、落地页、价格、博客和功能区可以预览。登录和付费功能提示需要配置。默认英文 `/`、功能 `/app`；中文 `/zh`、功能 `/zh/app`。

## 改成你的产品

- `src/config/site.ts`：品牌、canonical 域名环境变量、联系方式、注册赠送、任务成本、导航、套餐。
- `messages/en.json`、`messages/zh.json`：页面文案。
- `src/app/[locale]/(marketing)/features/demo`：独立落地页示例；新增页面后加入 `src/config/public-routes.ts`。
- `content/blog/en/*.mdx`、`content/blog/zh/*.mdx`：可信仓库文章。相同 slug 建立语言关联，缺失翻译不会进入文章 hreflang。元信息要求 title、description、date（引号包裹 YYYY-MM-DD）、author；可选 updated、draft。
- 隐私、条款、关于、支持邮箱、文章作者及图标是示例，正式上线前替换。OG 图片在 `src/app/opengraph-image.tsx`。

## 接入服务

详见 [上线指南](docs/launch.md) 和 [额度与支付设计](docs/architecture.md)。不要复用源项目的密钥或生产数据库。

## 检查

```sh
pnpm check:config
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

`pnpm test:db` 使用本机 PostgreSQL 的 initdb / pg_ctl 创建独立临时实例，自动停止并清理，不连接现有本地服务或 Supabase 生产库。首次运行浏览器测试请执行 `pnpm exec playwright install chromium --only-shell`。

```sh
pnpm test:db
pnpm check:config --production
pnpm indexnow --dry-run
pnpm indexnow
# 显式加入已删除的公开路径
pnpm indexnow /blog/deleted-post
```

IndexNow 命令仅在不带 `--dry-run` 时实际提交；检查线上 sitemap、同源 URL 和验证文件，无缓存状态依赖。
