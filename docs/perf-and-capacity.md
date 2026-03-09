# 订单与库存模块：性能与容量评估（面试向）

本文聚焦「下单 / 库存预占 / 支付回调」链路在高并发场景下的表现，以及系统在一致性上的边界设计。所有示例以 `hotel-management/backend` 为准。

## 1. 压测目标与场景设计

### 1.1 关键问题

- 并发下单时，是否会出现 **超卖** 或库存不一致？
- 支付网关在「**重复 / 乱序 / 延迟回调**」时，系统能否保持订单与库存的一致性？
- 在 PostgreSQL 下开启悲观锁后，对整体吞吐与 P95/P99 延迟的影响有多大？

### 1.2 压测工具与环境

- 工具：推荐使用 `k6`（也可替换为 `autocannon` / `wrk`）
- 环境：
  - Node.js 18+
  - PostgreSQL 14+
  - 后端以 `NODE_ENV=production` 方式运行，连接真实数据库

## 2. 压测脚本示例（k6）

### 2.1 并发下单场景

核心思路：对同一 `roomTypeId + date range` 发起高并发下单请求，观察最终库存与订单总数。

```js
// 文件建议路径：backend/perf/k6-orders-reserve.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '60s',
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TOKEN = __ENV.TOKEN; // 预先获取的 customer 登录 token

export default function () {
  const payload = JSON.stringify({
    hotelId: 1,
    roomTypeId: 1,
    checkInDate: '2026-05-01',
    checkOutDate: '2026-05-03',
    rooms: 1,
    guests: 2,
  });

  const res = http.post(`${BASE_URL}/api/orders`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  check(res, {
    'status is 201 or 403': (r) => r.status === 201 || r.status === 403,
  });

  sleep(0.2);
}
```

压测完成后，通过查询 `RoomInventory` 与 `Order` 表验证：

- 成功订单数 `<= 总库存`
- 任一日期的 `reserved + sold <= total` 恒成立

### 2.2 支付回调幂等与乱序场景

核心思路：针对同一 `orderId/eventId`，模拟多次回调与乱序到达。

```js
// 文件建议路径：backend/perf/k6-payments-callback.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 20,
  iterations: 200,
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const ORDER_ID = Number(__ENV.ORDER_ID || '1');
const EVENT_ID = __ENV.EVENT_ID || 'evt-demo-123';

export default function () {
  const payload = JSON.stringify({
    orderId: ORDER_ID,
    eventId: EVENT_ID,
    paymentNo: 'pay-demo-123',
  });

  const res = http.post(`${BASE_URL}/api/payments/callback`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'ok is true': (r) => r.json('ok') === true,
  });
}
```

验证要点：

- `PaymentEvent` 表中仅存在一条 `eventId = EVENT_ID` 的记录
- 订单最终状态为 `PAID` 或（过期场景中）`EXPIRED/CANCELLED`，不会出现重复扣减库存

## 3. 一致性边界说明

### 3.1 强一致性不变量

- 库存：
  - 任意时刻满足：`reserved + sold <= total`
  - 在 PostgreSQL 下，通过对 `RoomInventory` 行加 **悲观写锁** 保证并发扣减安全
- 订单：
  - 状态机：只能在以下集合内迁移  
    `PENDING_PAYMENT → PAID / CANCELLED / EXPIRED`
  - `PENDING_PAYMENT` 订单在确认支付或取消/懒过期时会对应调用 `reserve/commit/release`，保持订单与库存的一致性

### 3.2 允许的弱一致窗口

- 公开酒店列表/详情页：
  - 为减轻数据库压力，列表可以做 **短期缓存**（例如 30s），在窗口期内价格或可订数量可能略滞后于真实值
  - 若用户在缓存窗口中下单，最终的一致性仍由库存模块保证（不可用则报错）
- 实时价格推送（SSE）：
  - 若客户端临时断线，重连后需通过完整的 REST 查询做一次“**状态对齐**”，SSE 只对“增量变更”提供加速

### 3.3 异常场景下的一致性策略

- **下单过程中数据库异常**：
  - 由于 `createOrder` 包裹在单一事务中，预占库存与订单写入要么全部成功，要么全部回滚
- **支付回调延迟/丢失**：
  - 若订单已过期（`expiresAt` 之前未支付），后续回调会被标记为 `IGNORED`，并释放预占库存
- **支付回调重复/乱序**：
  - `PaymentEvent.eventId` 唯一约束 + `OrdersService.confirmPaidByCallback` 对终态的幂等处理，保证不会重复扣减库存、不会将已取消/过期订单错误迁移到 `PAID`

## 4. 实际压测结果与调优思路（本机）

> 说明：以下为在本机（PostgreSQL + Node 18）上对 `/api/orders` 做的实测数据，用于面试时给出“真实指标”。

- 在 **50 VUs、60 秒** 并发下单压测中（脚本：`backend/perf/k6-orders-reserve.js`，参数为真实种子酒店 `hotelId=58955, roomTypeId=170029`）：
  - 吞吐：`http_reqs ≈ 13,586`，约 **225 req/s**
  - 延迟：`http_req_duration P95 ≈ 40.6ms`，平均 ≈ 21ms，P90 ≈ 35.7ms
  - 业务检查：所有请求状态码均为 **201 或 403**（403 表示命中库存/业务约束），自定义 check 通过率 **100%**
- 调优方向（若未来需要进一步放大规模）：
  - 根据 PG 的表现调节连接池最大连接数、观察锁等待时间分布
  - 在热点 `roomTypeId + date` 上适当拆分库存或增加读缓存，避免热点行锁竞争

---

通过以上压测脚本与一致性边界说明，可以在面试中系统回答「高并发下如何防超卖」「支付回调乱序怎么办」「有没有做过容量评估与压测」等问题，并且给出可验证的证据（脚本 + 报告）。
