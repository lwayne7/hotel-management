/**
 * k6 并发防超卖压测脚本
 *
 * 验证目标：50 个虚拟用户同时对同一房型下单，最终成功订单数 ≤ 库存数量。
 * 核心逻辑：服务端通过 PostgreSQL 悲观行锁（FOR UPDATE）+ 原子 SQL 双重防超卖，
 * 本脚本用于验证该机制在真实并发场景下确实有效。
 *
 * 使用前提：
 *   1. 后端服务已启动：PORT=3000
 *   2. 数据库已有可用酒店、房型与库存（至少 1 间，建议 10 间以观察超售情况）
 *   3. 已登录并获取有效 access_token
 *
 * 运行方式：
 *   k6 run \
 *     --env BASE_URL=http://localhost:3000 \
 *     --env TOKEN=<your_jwt_access_token> \
 *     --env HOTEL_ID=1 \
 *     --env ROOM_TYPE_ID=1 \
 *     --env CHECK_IN=2026-08-01 \
 *     --env CHECK_OUT=2026-08-02 \
 *     k6/concurrency-test.js
 *
 * 预期结果：
 *   - http_req_failed 应为 0（没有网络错误）
 *   - 状态码 201（下单成功）的数量 ≤ 该房型该日期的库存数
 *   - 状态码 409（库存不足）的数量 = VUs - 成功数
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// 自定义指标：统计成功与失败的下单次数
const successOrders = new Counter('orders_created');
const failedOrders = new Counter('orders_inventory_exhausted');

export const options = {
  // 50 个虚拟用户同时发起请求，持续 10 秒
  vus: 50,
  duration: '10s',

  thresholds: {
    // 所有请求必须在 2 秒内完成（P95）
    http_req_duration: ['p(95)<2000'],
    // 无网络级错误
    http_req_failed: ['rate==0'],
    // 成功订单数必须 ≤ 库存（通过 check 验证，不能在 threshold 里直接断言，仅记录）
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TOKEN = __ENV.TOKEN || '';
const HOTEL_ID = parseInt(__ENV.HOTEL_ID || '1', 10);
const ROOM_TYPE_ID = parseInt(__ENV.ROOM_TYPE_ID || '1', 10);
const CHECK_IN = __ENV.CHECK_IN || '2026-08-01';
const CHECK_OUT = __ENV.CHECK_OUT || '2026-08-02';

const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

export default function () {
  const payload = JSON.stringify({
    hotelId: HOTEL_ID,
    roomTypeId: ROOM_TYPE_ID,
    checkInDate: CHECK_IN,
    checkOutDate: CHECK_OUT,
    rooms: 1,
    guests: 1,
  });

  const res = http.post(`${BASE_URL}/api/v1/orders`, payload, {
    headers: HEADERS,
  });

  // 合法响应码：201 = 下单成功，409 = 库存不足（防超卖正确触发）
  const isExpected = check(res, {
    'status is 201 or 409': (r) => r.status === 201 || r.status === 409,
  });

  if (!isExpected) {
    console.error(`Unexpected status: ${res.status}, body: ${res.body}`);
  }

  if (res.status === 201) {
    successOrders.add(1);
  } else if (res.status === 409) {
    failedOrders.add(1);
  }

  // 轻微间隔，模拟真实用户行为（不影响并发效果）
  sleep(0.1);
}

export function handleSummary(data) {
  const created = data.metrics.orders_created?.values?.count ?? 0;
  const exhausted = data.metrics.orders_inventory_exhausted?.values?.count ?? 0;

  console.log('\n========= 防超卖验证结果 =========');
  console.log(`成功下单数：${created}`);
  console.log(`库存不足数：${exhausted}`);
  console.log(`总请求数：${created + exhausted}`);
  console.log(
    `结论：若 成功下单数 ≤ 数据库中该日期库存数，则悲观锁防超卖机制验证通过。`,
  );
  console.log('===================================\n');

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
