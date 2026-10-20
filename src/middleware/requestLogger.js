'use strict';

/**
 * Mencatat method, path, status, dan durasi setiap request.
 * Dimatikan saat NODE_ENV=test supaya output test tetap bersih.
 */
function requestLogger(req, res, next) {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs.toFixed(1)} ms)`);
  });
  return next();
}

module.exports = { requestLogger };
