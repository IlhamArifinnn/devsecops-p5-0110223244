'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const config = require('../src/config');
const { generateId } = require('../src/utils/id');

describe('perbaikan temuan SAST', () => {
  const app = createApp();

  test('path traversal pada /api/export tidak bisa membaca file di luar folder exports', async () => {
    const attempts = ['..%2Fpackage.json', '..%2F..%2Fetc%2Fpasswd', '%2Fetc%2Fpasswd'];
    for (const attempt of attempts) {
      const res = await request(app).get(`/api/export/${attempt}`);
      expect(res.status).toBe(404);
      expect(res.text).not.toContain('"name": "devsecops-p5-0110223244"');
      expect(res.text).not.toContain('root:');
    }
  });

  test('header X-Powered-By tidak dikirim', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('ID task memakai format UUID v4', () => {
    expect(generateId()).toMatch(
      /^task-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  test('/api/export dibatasi rate limit (429 setelah melewati batas)', async () => {
    const limitedApp = createApp({
      cfg: { ...config, exportRateLimit: { windowMs: 60 * 1000, limit: 2 } },
    });

    expect((await request(limitedApp).get('/api/export/sample-report.txt')).status).toBe(200);
    expect((await request(limitedApp).get('/api/export/sample-report.txt')).status).toBe(200);

    const blocked = await request(limitedApp).get('/api/export/sample-report.txt');
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/Terlalu banyak request/);
  });
});
