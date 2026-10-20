'use strict';

/**
 * Membuat ID unik untuk sebuah task.
 * Format: task-<timestamp base36>-<random base36>
 */
function generateId() {
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `task-${timePart}-${randomPart}`;
}

module.exports = { generateId };
