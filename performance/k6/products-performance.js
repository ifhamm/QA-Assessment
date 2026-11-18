import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    low_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '20s', target: 5 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    'http_req_failed': ['rate<0.01'],
    'http_req_duration': ['p(95)<500'],
    'http_req_duration{type:articles_list}': ['p(95)<500'],
    'http_req_duration{type:tags_list}': ['p(95)<500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const articlesRes = http.get(`${BASE_URL}/api/articles`, {
    tags: { type: 'articles_list' },
  });
  check(articlesRes, {
    'GET /api/articles status is 200': (r) => r.status === 200,
  });

  const tagsRes = http.get(`${BASE_URL}/api/tags`, {
    tags: { type: 'tags_list' },
  });
  check(tagsRes, {
    'GET /api/tags status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
