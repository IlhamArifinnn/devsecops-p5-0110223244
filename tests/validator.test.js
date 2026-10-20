'use strict';

const { validateTask } = require('../src/utils/validator');

describe('validateTask', () => {
  test('menerima payload yang valid', () => {
    const result = validateTask({ title: 'Belajar GitHub Actions', priority: 'high' });
    expect(result).toEqual({ valid: true, errors: [] });
  });

  test('menolak title kosong atau bukan string', () => {
    expect(validateTask({ title: '   ' }).valid).toBe(false);
    expect(validateTask({ title: 123 }).valid).toBe(false);
    expect(validateTask(undefined).errors).toContain('title wajib diisi');
  });

  test('menolak title yang terlalu panjang', () => {
    const result = validateTask({ title: 'x'.repeat(101) });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/maksimal 100/);
  });

  test('menolak priority dan status di luar daftar', () => {
    const result = validateTask({ title: 'ok', priority: 'urgent', status: 'blocked' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  test('menolak dueDate yang bukan tanggal', () => {
    const result = validateTask({ title: 'ok', dueDate: 'besok pagi' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/dueDate/);
  });

  test('mode partial tidak mewajibkan title', () => {
    expect(validateTask({ status: 'done' }, { partial: true }).valid).toBe(true);
    expect(validateTask({ title: '' }, { partial: true }).valid).toBe(false);
  });
});
