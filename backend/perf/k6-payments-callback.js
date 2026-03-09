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

