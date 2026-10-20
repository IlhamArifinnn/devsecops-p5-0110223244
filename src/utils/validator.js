'use strict';

const config = require('../config');

/**
 * Memvalidasi payload task.
 * @param {object} input        data dari request body
 * @param {object} [options]
 * @param {boolean} [options.partial=false] true untuk update parsial (title tidak wajib)
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateTask(input, { partial = false } = {}) {
  const errors = [];
  const data = input && typeof input === 'object' ? input : {};

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim() === '') {
      errors.push('title wajib diisi');
    } else if (data.title.length > config.maxTitleLength) {
      errors.push(`title maksimal ${config.maxTitleLength} karakter`);
    }
  }

  if (data.priority !== undefined && !config.allowedPriorities.includes(data.priority)) {
    errors.push(`priority harus salah satu dari: ${config.allowedPriorities.join(', ')}`);
  }

  if (data.status !== undefined && !config.allowedStatuses.includes(data.status)) {
    errors.push(`status harus salah satu dari: ${config.allowedStatuses.join(', ')}`);
  }

  if (data.dueDate !== undefined && Number.isNaN(Date.parse(data.dueDate))) {
    errors.push('dueDate harus berupa tanggal valid (format ISO 8601)');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateTask };
