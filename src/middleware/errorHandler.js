'use strict';

function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} tidak ditemukan` });
}

// Express mengenali error handler dari jumlah parameternya (4), jadi `next` harus tetap ada.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Body request bukan JSON yang valid' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
}

module.exports = { notFound, errorHandler };
