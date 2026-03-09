import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '60s',
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TOKEN = __ENV.TOKEN;

export default function () {
  const payload = JSON.stringify({
    hotelId: 58955,
    roomTypeId: 170029,
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

