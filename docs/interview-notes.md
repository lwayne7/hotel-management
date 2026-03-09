# 面试话术笔记：易宿酒店预订平台

## 1. 防超卖与库存一致性

- **业务问题**：酒店房型库存有限，如果多个用户同时下单，可能出现“卖超”的情况，用户到店发现没房间，体验非常差。
- **方案设计**：
  - 设计 `RoomInventory(roomTypeId, date, total, reserved, sold)` 日历库存表，对 `(roomTypeId, date)` 做唯一约束
  - 下单时调用 `reserve`：校验 `total - reserved - sold >= rooms`，并在事务内 `reserved += rooms`
  - 支付成功时调用 `commit`：`reserved -= rooms` 且 `sold += rooms`
  - 取消/过期时调用 `release`：`reserved -= rooms`
- **并发与回滚细节**：
  - 在 PostgreSQL 下对库存行使用悲观写锁，保证同一房型同一天只有一个事务能修改
  - `createOrder` / `confirmPaidByCallback` / `cancelOrder` 都在单一事务内完成“订单+库存”的变更，要么全部成功，要么全部回滚
- **Trade-off**：
  - 简化了实现，没有引入消息队列或复杂预扣模型
  - 热点房型在高并发下会有锁竞争，但在当前项目体量下是可以接受的，同时也方便在面试中讨论“如何进一步拆分热点行”

## 2. 支付回调幂等与乱序

- **实际问题**：第三方支付回调可能出现“重复回调”“乱序到达”，如果不处理好，会导致订单多次扣库存或从终态被拉回中间态。
- **方案设计**：
  - 引入 `PaymentEvent(eventId unique)` 事件表，`eventId` 是第三方回调的幂等键
  - 收到回调时先查 `PaymentEvent` 是否存在：
    - 已存在：直接返回 `idempotent: true`
    - 不存在：插入事件记录，再调用 `OrdersService.confirmPaidByCallback`
  - `confirmPaidByCallback` 内部做状态机校验：
    - 已是 `PAID/CANCELLED/EXPIRED` 的订单直接返回，保证乱序回调不会改变终态
    - 仅在 `PENDING_PAYMENT` 且未过期时才执行 `commit` 和状态迁移到 `PAID`
- **效果**：
  - 重复回调：只会有一条 `PaymentEvent` 记录，订单不会被重复扣库存
  - 乱序回调：订单已经进入终态时，后到的回调被标记为 `IGNORED`

## 3. SSE + WebSocket 的组合与多端适配

- **为什么公开端用 SSE，管理端用 WebSocket**：
  - 公开端更多是“列表/详情的价格变更通知”，发送方向主要是后端 → 客户端，对消息可靠性和顺序的要求相对较低，SSE 实现简单且基于 HTTP
  - 管理端需要“审核结果/订单状态”的低延迟推送，且需要按用户/角色精确分发，WebSocket 更适合双向实时通信
- **多端适配策略**：
  - H5：直接用 `EventSource` 订阅 SSE，并实现断线重连 + keepalive 节流
  - 小程序 / RN：由于运行时不支持 `EventSource`，通过轮询接口兜底，同时用 TanStack Query 的缓存减少不必要请求
- **面试点**：
  - 说明清楚不同实时方案的优缺点：实现复杂度 / 兼容性 / 连接数量等
  - 表达出“先用简单方案解决 80% 问题，再用适配层兼容剩下 20%”的思路

## 4. 可观测性与排障流程

- **做了什么**：
  - 使用 `prom-client` 暴露 `/metrics`，包括默认进程指标 + 自定义的 `http_requests_total` 和 `http_request_duration_ms`
  - 通过全局 `LoggingInterceptor` 输出结构化日志：`requestId/method/route/statusCode/durationMs`
  - `RequestContextMiddleware` 负责透传/生成 `x-request-id`
  - `/healthz` 端点对数据库执行 `SELECT 1`，并返回响应时间
- **排障示例**：
  - 当监控发现“订单接口 P95 > 2s”时：
    1. 先看 `/metrics` 中对应 route 的延迟分布
    2. 通过日志中的 `requestId` 关联具体请求，进一步看涉及到的 `orderId/roomTypeId`
    3. 结合数据库慢查询日志，判断是锁竞争还是索引问题

## 5. 测试与 CI：如何保证闭环稳定

- **单元测试**：
  - `orders.service.spec.ts`：验证库存不足、重复 confirmPaid、取消释放库存、删除订单约束等
  - `payments.service.spec.ts`：验证重复 eventId 的幂等行为
- **E2E 测试**：
  - `orders-flow.e2e-spec.ts`：从登录、下单、支付回调到“我的订单”查询的完整业务闭环
- **CI 草案**：
  - GitHub Actions 示例工作流：每个 PR 自动跑 lint、unit test、e2e test、build

> 面试时可以强调：不仅仅是“写了测试”，而是围绕业务不变量设计了测试，并有能力把这些检查挂到 CI 上。

## 6. 与简历点的对齐

- 简历中关于易宿项目的关键表述，在仓库里都有对应“证据”：
  - “预订闭环 & 并发一致性”：对应 `Orders/Inventory/Payments` 模块实现 + 单测/E2E + `perf-and-capacity.md`
  - “SSE + 轮询 + WebSocket 实时链路”：对应后端 SSE/WS 模块与 Taro 端 `usePriceUpdates` 的跨端实现
  - “列表虚拟滚动 & 首屏优化”：对应 Taro 列表页的分页策略，以及管理端路由懒加载与 Skeleton
  - “工程化 & 质量”：对应测试金字塔文档与示例 CI workflow

有了这些准备，你在面试中可以围绕“业务问题 → 方案 → 效果 → 权衡”来讲易宿项目，而不是停留在“我用过 React/Nest/Taro”这一层。***
