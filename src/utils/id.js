'use strict';

const { randomUUID } = require('node:crypto');

/**
 * Membuat ID unik untuk sebuah task.
 * Format: task-<UUID v4> (memakai generator acak yang aman secara kriptografi).
 */
function generateId() {
  return `task-${randomUUID()}`;
}

module.exports = { generateId };
