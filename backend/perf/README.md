# Performance Scripts

- `k6-orders-reserve.js`：模拟用户下单，观察库存预占与超卖保护表现。
- `k6-payments-callback.js`：模拟重复支付回调，验证幂等处理是否稳定。

## 用法

```bash
BASE_URL=http://localhost:3000 TOKEN=<customer_jwt> k6 run k6-orders-reserve.js
BASE_URL=http://localhost:3000 ORDER_ID=<order_id> EVENT_ID=<event_id> k6 run k6-payments-callback.js
```

## 面试可讲版本

- 这些脚本不是完整压测平台，而是用来快速证明“我考虑过并发下单和重复回调”的验证材料。
- 重点不是 QPS 数字本身，而是说明你能把库存保护、幂等处理和压测脚本串成一套闭环。
