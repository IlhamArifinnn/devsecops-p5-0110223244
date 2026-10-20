'use strict';

const { createTaskService } = require('../src/services/taskService');
const { generateId } = require('../src/utils/id');

describe('generateId', () => {
  test('menghasilkan ID unik dengan prefix task-', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()));
    expect(ids.size).toBe(50);
    for (const id of ids) {
      expect(id.startsWith('task-')).toBe(true);
    }
  });
});

describe('taskService', () => {
  let service;

  beforeEach(() => {
    service = createTaskService();
  });

  test('create menyimpan task dengan nilai default', () => {
    const result = service.create({ title: '  Tulis laporan  ' });
    expect(result.ok).toBe(true);
    expect(result.task).toMatchObject({
      title: 'Tulis laporan',
      priority: 'medium',
      status: 'todo',
      dueDate: null,
    });
    expect(service.getById(result.task.id)).toEqual(result.task);
  });

  test('create menolak payload tidak valid', () => {
    const result = service.create({ title: '' });
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('list bisa difilter berdasarkan status dan priority', () => {
    service.create({ title: 'A', priority: 'high' });
    service.create({ title: 'B', priority: 'low', status: 'done' });
    service.create({ title: 'C', priority: 'high', status: 'done' });

    expect(service.list()).toHaveLength(3);
    expect(service.list({ status: 'done' })).toHaveLength(2);
    expect(service.list({ priority: 'high' })).toHaveLength(2);
    expect(service.list({ status: 'done', priority: 'high' })).toHaveLength(1);
  });

  test('update mengubah field tetapi mempertahankan id dan createdAt', () => {
    const { task } = service.create({ title: 'Lama' });
    const result = service.update(task.id, { title: ' Baru ', status: 'in-progress', id: 'hack' });

    expect(result.ok).toBe(true);
    expect(result.task.id).toBe(task.id);
    expect(result.task.createdAt).toBe(task.createdAt);
    expect(result.task.title).toBe('Baru');
    expect(result.task.status).toBe('in-progress');
  });

  test('update mengembalikan notFound atau error validasi', () => {
    expect(service.update('tidak-ada', { title: 'x' }).notFound).toBe(true);

    const { task } = service.create({ title: 'Ada' });
    const invalid = service.update(task.id, { priority: 'urgent' });
    expect(invalid.ok).toBe(false);
    expect(invalid.notFound).toBeUndefined();
  });

  test('remove menghapus task yang ada', () => {
    const { task } = service.create({ title: 'Hapus aku' });
    expect(service.remove(task.id)).toBe(true);
    expect(service.remove(task.id)).toBe(false);
    expect(service.getById(task.id)).toBeNull();
  });

  test('stats menghitung ringkasan dengan benar', () => {
    expect(service.stats().completionRate).toBe(0);

    service.create({ title: 'A', priority: 'high' });
    service.create({ title: 'B', status: 'done' });
    service.create({ title: 'C', status: 'in-progress', priority: 'low' });
    service.create({ title: 'D', status: 'done' });

    expect(service.stats()).toEqual({
      total: 4,
      byStatus: { todo: 1, 'in-progress': 1, done: 2 },
      byPriority: { low: 1, medium: 2, high: 1 },
      completionRate: 50,
    });
  });

  test('clear mengosongkan semua task', () => {
    service.create({ title: 'A' });
    service.clear();
    expect(service.list()).toHaveLength(0);
  });
});
