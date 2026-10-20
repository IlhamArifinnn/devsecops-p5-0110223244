'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const { createTaskService } = require('../src/services/taskService');

describe('TaskFlow API', () => {
  let app;

  beforeEach(() => {
    app = createApp({ service: createTaskService() });
  });

  test('GET /health mengembalikan status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /api/tasks membuat task baru', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Setup pipeline', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Setup pipeline', priority: 'high', status: 'todo' });
    expect(res.body.id).toBeDefined();
  });

  test('POST /api/tasks menolak payload tidak valid', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('title wajib diisi');
  });

  test('POST /api/tasks menolak JSON yang rusak', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send('{"title": ');
    expect(res.status).toBe(400);
  });

  test('alur CRUD lengkap', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Task CRUD' });
    const { id } = created.body;

    const fetched = await request(app).get(`/api/tasks/${id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.title).toBe('Task CRUD');

    const updated = await request(app).put(`/api/tasks/${id}`).send({ status: 'done' });
    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe('done');

    const invalidUpdate = await request(app).put(`/api/tasks/${id}`).send({ priority: 'urgent' });
    expect(invalidUpdate.status).toBe(400);

    const deleted = await request(app).delete(`/api/tasks/${id}`);
    expect(deleted.status).toBe(204);

    const gone = await request(app).get(`/api/tasks/${id}`);
    expect(gone.status).toBe(404);
  });

  test('PUT dan DELETE untuk id yang tidak ada mengembalikan 404', async () => {
    expect((await request(app).put('/api/tasks/nope').send({ title: 'x' })).status).toBe(404);
    expect((await request(app).delete('/api/tasks/nope')).status).toBe(404);
  });

  test('GET /api/tasks mendukung filter dan /stats', async () => {
    await request(app).post('/api/tasks').send({ title: 'A', status: 'done' });
    await request(app).post('/api/tasks').send({ title: 'B' });

    const filtered = await request(app).get('/api/tasks').query({ status: 'done' });
    expect(filtered.body).toHaveLength(1);

    const stats = await request(app).get('/api/tasks/stats');
    expect(stats.body).toMatchObject({ total: 2, completionRate: 50 });
  });

  test('route yang tidak dikenal mengembalikan 404 JSON', async () => {
    const res = await request(app).get('/tidak-ada');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/tidak ditemukan/);
  });
});
