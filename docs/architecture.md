# 额度与支付设计

## 信任边界

浏览器只能请求服务端操作。服务端调用 Supabase `getUser()` 验证身份，写接口还校验请求 Origin。API 与管理页不会信任客户端给的余额、价格、管理员角色。service role key 不进入浏览器。所有数据表启用 RLS，用户只能读取自己的 profile、任务、订单和额度流水。写表和 RPC 仅 service_role 可用。

## 公开接口

- `GET /api/account`：账户、余额、最近 50 条流水、管理员状态；首次初始化一次性赠送。
- `POST /api/tasks/demo`：`{requestId: UUID, simulateFailure: boolean}`；服务端配置决定成本，返回任务状态、余额与 `replayed`。相同 ID 重放不重复扣减，改变任务参数返回冲突。额度不足返回 402。
- `POST /api/payments/checkout`：`{planId, locale: en|zh}`；从服务端配置绑定价格和商品，返回收银台 URL 与 intent ID。
- `GET /api/payments/status?intent=UUID`：仅订单所有者可查状态。成功页轮询服务器，不依据 URL 判断支付成功。
- `POST /api/payments/waffo/webhook`：原始 body 与 SDK 签名验证；service-role RPC 原子处理。
- `GET /api/admin` / `POST /api/admin`：服务端白名单；调整 body 为 `{requestId, userId, delta, reason}`。重试保留 requestId，不重复调整。

## 原子性与幂等

profiles 行锁串行化同一账户的余额修改。注册使用唯一 profile；任务使用全局唯一请求 ID并校验用户与参数。示例任务、扣减、失败退回及流水在同一数据库事务中完成。**真实外部 AI 调用不能放入该事务**：新项目接入真实耗时任务时，必须扩展成持久化预扣记录、异步执行及定期补偿，再开放流量。

purchase_intents 在 checkout 前锁定商品、金额、币种、买家和额度。支付通过 intent 与 provider 订单 ID 防重复入账。webhook 同时以 delivery ID 和 event type + business event ID 去重，避免同一退款换 delivery ID 被再次撤回。

部分退款金额为该次退款金额（SDK refundedAmount，兼容 amount）。累计退款对应的撤回额度向下取整，全额退款恰好撤回整包；扣除已经撤回的额度后写流水。余额允许为负，负数时无法运行任务，后续充值抵消负余额。

没有返回给前端的退款发起接口；退款由 Waffo 控制台发起，模板只消费签名退款通知。

## 运营与扩展

账户退出后客户端按用户 ID 区分缓存，防止切换账号展示前一个账号的数据。后台默认最近 100 条记录。上线前使用独立数据库与测试商品跑支付验收；仓库自动化测试不发起真实付款，不发送 IndexNow 请求。
