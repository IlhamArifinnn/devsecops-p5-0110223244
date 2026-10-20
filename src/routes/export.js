'use strict';

const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

/**
 * Endpoint untuk mengunduh file laporan dari folder `exports/`.
 * GET /api/export/:name  ->  isi file `exports/<name>` sebagai teks.
 */
function createExportRouter(cfg) {
  const router = express.Router();

  router.get('/:name', (req, res) => {
    const filePath = path.join(cfg.exportDir, req.params.name);

    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        return res.status(404).json({ error: 'File export tidak ditemukan' });
      }
      return res.type('text/plain').send(content);
    });
  });

  return router;
}

module.exports = { createExportRouter };
