'use strict';

const express = require('express');

/**
 * Router CRUD untuk resource task.
 * @param {ReturnType<import('../services/taskService').createTaskService>} service
 */
function createTasksRouter(service) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const { status, priority } = req.query;
    res.json(service.list({ status, priority }));
  });

  // Harus didefinisikan sebelum '/:id' supaya 'stats' tidak dianggap sebagai id.
  router.get('/stats', (req, res) => {
    res.json(service.stats());
  });

  router.get('/:id', (req, res) => {
    const task = service.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task tidak ditemukan' });
    }
    return res.json(task);
  });

  router.post('/', (req, res) => {
    const result = service.create(req.body);
    if (!result.ok) {
      return res.status(400).json({ errors: result.errors });
    }
    return res.status(201).json(result.task);
  });

  router.put('/:id', (req, res) => {
    const result = service.update(req.params.id, req.body);
    if (result.notFound) {
      return res.status(404).json({ error: 'Task tidak ditemukan' });
    }
    if (!result.ok) {
      return res.status(400).json({ errors: result.errors });
    }
    return res.json(result.task);
  });

  router.delete('/:id', (req, res) => {
    if (!service.remove(req.params.id)) {
      return res.status(404).json({ error: 'Task tidak ditemukan' });
    }
    return res.status(204).end();
  });

  return router;
}

module.exports = { createTasksRouter };
