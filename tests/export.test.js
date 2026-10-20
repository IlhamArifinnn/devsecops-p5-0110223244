'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');

describe('GET /api/export/:name', () => {
  const app = createApp();

  test('mengembalikan isi file yang ada', async () => {
    const res = await request(app).get('/api/export/sample-report.txt');
    expect(res.status).toBe(200);
    expect(res.text).toContain('TaskFlow API');
  });

  test('mengembalikan 404 untuk file yang tidak ada', async () => {
    const res = await request(app).get('/api/export/tidak-ada.txt');
    expect(res.status).toBe(404);
  });
});
