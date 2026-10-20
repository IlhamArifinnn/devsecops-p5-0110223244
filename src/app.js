'use strict';

const express = require('express');
const config = require('./config');
const { createTaskService } = require('./services/taskService');
const { createTasksRouter } = require('./routes/tasks');
const { createExportRouter } = require('./routes/export');
const { requestLogger } = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

/**
 * Membuat instance aplikasi Express.
 * Dependency bisa di-inject supaya mudah dites.
 */
function createApp({ service = createTaskService(), cfg = config } = {}) {
  const app = express();
  app.disable('x-powered-by'); // jangan bocorkan teknologi server lewat header

  app.use(express.json({ limit: '10kb' }));
  app.use(requestLogger);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
  });

  app.use('/api/tasks', createTasksRouter(service));
  app.use('/api/export', createExportRouter(cfg));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
