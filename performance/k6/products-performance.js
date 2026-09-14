import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    low_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 }, // ramp from 0 to 5 VUs over 10 seconds
        { duration: '20s', target: 5 }, // hold 5 VUs for 20 seconds
        { duration: '10s', target: 0 }, // ramp down to 0 over 10 seconds
      ],
    },
  },
  thresholds: {
    'http_req_failed': ['rate<0.01'], // global error rate < 1%
    'http_req_duration': ['p(95)<500'], // global p95 response time < 500 ms
    'http_req_duration{type:products_list}': ['p(95)<500'], // products_list p95 < 500 ms
    'http_req_duration{type:product_detail}': ['p(95)<500'], // product_detail p95 < 500 ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Call GET /api/products
  const listRes = http.get(`${BASE_URL}/api/products`, {
    tags: { type: 'products_list' },
  });
  
  // Check status is 200
  check(listRes, {
    'GET /api/products status is 200': (r) => r.status === 200,
  });

  // Call GET /api/products/1
  const detailRes = http.get(`${BASE_URL}/api/products/1`, {
    tags: { type: 'product_detail' },
  });

  // Check status is 200
  check(detailRes, {
    'GET /api/products/1 status is 200': (r) => r.status === 200,
  });

  // Sleep for 1 second
  sleep(1);
}
