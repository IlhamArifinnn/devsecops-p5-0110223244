'use strict';

const { generateId } = require('../utils/id');
const { validateTask } = require('../utils/validator');

/**
 * Service manajemen task (penyimpanan in-memory).
 * Dibuat sebagai factory supaya setiap test punya state yang bersih.
 */
function createTaskService() {
  const tasks = new Map();

  function create(input) {
    const { valid, errors } = validateTask(input);
    if (!valid) {
      return { ok: false, errors };
    }

    const now = new Date().toISOString();
    const task = {
      id: generateId(),
      title: input.title.trim(),
      description: input.description || '',
      priority: input.priority || 'medium',
      status: input.status || 'todo',
      dueDate: input.dueDate || null,
      createdAt: now,
      updatedAt: now,
    };
    tasks.set(task.id, task);
    return { ok: true, task };
  }

  function list({ status, priority } = {}) {
    return [...tasks.values()].filter(
      (task) => (!status || task.status === status) && (!priority || task.priority === priority),
    );
  }

  function getById(id) {
    return tasks.get(id) || null;
  }

  function update(id, input) {
    const existing = tasks.get(id);
    if (!existing) {
      return { ok: false, notFound: true, errors: ['task tidak ditemukan'] };
    }

    const { valid, errors } = validateTask(input, { partial: true });
    if (!valid) {
      return { ok: false, errors };
    }

    const updated = {
      ...existing,
      ...input,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    if (typeof updated.title === 'string') {
      updated.title = updated.title.trim();
    }
    tasks.set(id, updated);
    return { ok: true, task: updated };
  }

  function remove(id) {
    return tasks.delete(id);
  }

  function stats() {
    const all = [...tasks.values()];
    const byStatus = { todo: 0, 'in-progress': 0, done: 0 };
    const byPriority = { low: 0, medium: 0, high: 0 };

    for (const task of all) {
      byStatus[task.status] += 1;
      byPriority[task.priority] += 1;
    }

    const completionRate = all.length === 0 ? 0 : Math.round((byStatus.done / all.length) * 100);
    return { total: all.length, byStatus, byPriority, completionRate };
  }

  function clear() {
    tasks.clear();
  }

  return { create, list, getById, update, remove, stats, clear };
}

module.exports = { createTaskService };
