'use strict';

const { EventEmitter } = require('node:events');
const { requestLogger, sanitizeForLog } = require('../src/middleware/requestLogger');

describe('requestLogger', () => {
  test('sanitizeForLog membuang karakter CR dan LF', () => {
    expect(sanitizeForLog('/api\r\nFAKE: baris palsu')).toBe('/apiFAKE: baris palsu');
    expect(sanitizeForLog('GET')).toBe('GET');
  });

  test('mencatat tepat satu baris log tanpa karakter baris baru', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development'; // logger dimatikan saat NODE_ENV=test
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const res = new EventEmitter();
    res.statusCode = 200;
    const next = jest.fn();

    requestLogger({ method: 'GET', originalUrl: '/x\r\nFAKE: log' }, res, next);
    res.emit('finish');

    expect(next).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toMatch(/^GET \/xFAKE: log -> 200 /);
    expect(logSpy.mock.calls[0][0]).not.toMatch(/[\r\n]/);

    logSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });
});
