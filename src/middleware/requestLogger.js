'use strict';

/**
 * Menghapus karakter baris baru (CR/LF) dari data yang berasal dari request,
 * supaya penyerang tidak bisa menyisipkan baris log palsu (log injection).
 */
function sanitizeForLog(value) {
  return String(value).replace(/[\r\n]/g, '');
}

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
    const method = sanitizeForLog(req.method);
    const url = sanitizeForLog(req.originalUrl);
    console.log(`${method} ${url} -> ${res.statusCode} (${durationMs.toFixed(1)} ms)`);
  });
  return next();
}

module.exports = { requestLogger, sanitizeForLog };
