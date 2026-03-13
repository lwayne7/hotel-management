# Performance Scripts

- `k6-orders-reserve.js`：模拟用户下单，观察库存预占与超卖保护表现。
- `k6-payments-callback.js`：模拟重复支付回调，验证幂等处理是否稳定。

## 用法

```bash
BASE_URL=http://localhost:3000 TOKEN=<customer_jwt> k6 run k6-orders-reserve.js
BASE_URL=http://localhost:3000 ORDER_ID=<order_id> EVENT_ID=<event_id> k6 run k6-payments-callback.js
```

## 说明

- 这些脚本用于验证并发下单场景下的库存保护以及重复回调的幂等处理。
- 重点关注库存保护、幂等处理与状态机约束的正确性，而非单纯的 QPS 数字。
