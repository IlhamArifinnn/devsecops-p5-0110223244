'use strict';

const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const rateLimit = require('express-rate-limit');

/**
 * Endpoint untuk mengunduh file laporan dari folder `exports/`.
 * GET /api/export/:name  ->  isi file `exports/<name>` sebagai teks.
 */
function createExportRouter(cfg) {
  const router = express.Router();
  const baseDir = path.resolve(cfg.exportDir);

  // Batasi jumlah request per IP supaya endpoint yang mengakses file tidak bisa dibanjiri.
  const limiter = rateLimit({
    windowMs: cfg.exportRateLimit.windowMs,
    limit: cfg.exportRateLimit.limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Terlalu banyak request, coba lagi nanti' },
  });

  router.get('/:name', limiter, (req, res) => {
    // Lapis 1: buang semua komponen direktori ("../", "/etc/", dst.)
    const safeName = path.basename(req.params.name);
    const filePath = path.resolve(baseDir, safeName);

    // Lapis 2: pastikan hasil akhirnya benar-benar masih di dalam folder exports
    if (!filePath.startsWith(baseDir + path.sep)) {
      return res.status(400).json({ error: 'Nama file tidak valid' });
    }

    return fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        return res.status(404).json({ error: 'File export tidak ditemukan' });
      }
      return res.type('text/plain').send(content);
    });
  });

  return router;
}

module.exports = { createExportRouter };
