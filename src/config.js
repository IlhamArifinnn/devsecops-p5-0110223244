'use strict';

const path = require('node:path');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  maxTitleLength: 100,
  allowedPriorities: ['low', 'medium', 'high'],
  allowedStatuses: ['todo', 'in-progress', 'done'],
  // Folder berisi file laporan yang boleh diunduh lewat endpoint /api/export
  exportDir: path.join(__dirname, '..', 'exports'),
};
