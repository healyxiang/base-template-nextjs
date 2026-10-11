# 上线指南

## 1. 内容与环境

复制 `.env.example` 为 `.env.local`。在 Vercel 分别配置 Preview 与 Production 变量；`NEXT_PUBLIC_*` 在构建时注入，修改后重新部署。canonical `NEXT_PUBLIC_SITE_URL` 使用站点实际域名。配置品牌、支持邮箱、套餐、文章、图标和协议。运行 `pnpm check:config --production`。

## 2. Supabase

创建新项目，在 SQL Editor 执行 `supabase/migrations/001_template.sql`，不要在现有业务库直接执行。配置 URL、anon key、service role key。service role 仅供服务端使用。

启用 Email 和 Google provider。邮箱模板使用 `{{ .Token }}` 提供验证码（不是只给 magic link）；配置 SMTP、验证码期限与 Supabase 发送频率限制。Google 在 Supabase 配置 provider 凭据。Auth 的 Site URL 使用 canonical 域名，Redirect URLs 添加 `https://your-domain.com/api/auth/callback` 和本地 callback；Preview 若需登录，另行授权具体 Preview 回调 URL。

注册赠送由第一次受验证的账户初始化原子发放，每个用户 ID 仅一次；数据库余额与流水是最终依据。

## 3. Waffo

配置 merchant ID、private key、store ID，测试环境 `WAFFO_ENVIRONMENT=test`。创建三个 **一次性、USD、无折扣、总价固定** 商品：默认 $9/100、$19/250、$49/750。分别填 `WAFFO_PRODUCT_STARTER/GROWTH/SCALE`；修改模板套餐后同步修改商品价格。不要为本版商品启用额外税额或折扣，否则金额校验会拒绝入账。

设置 webhook：`https://your-domain.com/api/payments/waffo/webhook`，订阅 `order.completed` 和 `refund.succeeded`。开启 `ONLINE_PAYMENT_ENABLED=true` 后测试登录、checkout、重复通知、支付确认、部分和全额退款。SDK 验证签名；服务端核对 mode、store、买家邮箱、金额、币种及 checkout 写入的商品 metadata。产品 metadata 映射由服务端写入，不能由浏览器指定。

正式上线切换生产店铺、商品和私钥，并设 `WAFFO_ENVIRONMENT=prod`。不要给生产数据库发送测试事件。Webhook 失败会返回非 2xx 以便重试；退款早于订单确认时也需要重试。后台查看订单与流水定位入账。

## 4. 管理员

`ADMIN_USER_IDS` 填已经登录的 Supabase 用户 UUID（逗号分隔）。访问 `/admin` 或 `/zh/admin`。管理页和接口分别校验白名单；额度调整要求原因并写审计日志。首次登录后账户才会出现在 profiles 中。后台各列表显示最近 100 条，是最小运营页面；更大的运营规模可再加筛选与分页。

## 5. 分析、监控与搜索

GA4 使用 `NEXT_PUBLIC_GA4_ID`，Clarity 使用 `NEXT_PUBLIC_CLARITY_ID`。生产设置 `NEXT_PUBLIC_ANALYTICS_ENABLED=true`、`NEXT_PUBLIC_VERCEL_ENV=production`。本版无 Cookie 同意弹窗；按已确认需求直接启用分析。路由浏览不包含查询参数；转化事件不包含邮箱及任务内容，purchase 使用订单 ID 去重。

可选 Sentry：配置 DSN；如上传 sourcemap，额外填 org、project、构建专用 auth token。默认不采集 PII、不启用 Session Replay。

GSC 与 Bing Webmaster 选择 HTML meta 验证，将值填入 `GOOGLE_SITE_VERIFICATION`、`BING_SITE_VERIFICATION`，部署后在对应控制台验证，提交 `/sitemap.xml`。设置随机 `INDEXNOW_KEY`，确认 `/<key>.txt` 可访问，执行 `pnpm indexnow --dry-run`，确认后运行 `pnpm indexnow`。提交删除路径时将其作为命令参数。没有自动部署提交任务。

## 6. 发布验收

运行 lint、typecheck、测试和 build；检查手机导航、双语切换、登录回跳、赠送幂等、任务失败退回、退款负余额及直接访问管理接口。用独立测试项目验证真实 OAuth、邮箱和 Waffo 回调。生产发布后核对 canonical、验证 meta、sitemap、核心转化事件和错误监控。
