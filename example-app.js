const bodyParser = require('body-parser');
const express = require('express');

const app = module.exports = express();

app.get('/', (req, res) => res.json('eps1.0_hellofriend.mov'));

app.get('/text', (req, res) => res.set('Content-Type', 'text/plain').send('eps1.1_ones-and-zer0es.mpeg'));

app.get('/errored', (req, res, next) => {
  next({
    code: 'NOT_AUTHORIZED',
    name: 'UnauthorizedError',
    message: 'You are not authorized, yo',
    status: 401,
  });
});

app.use(bodyParser.json({ limit: '1mb' }), (req, res) => res.json({
  method: req.method,
  url: req.url,
  path: req.path,
  headers: req.headers,
  qs: req.query,
  body: req.body || {},
}));

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  res.status(err.status || 500).json({
    error: true,
    code: err.code || null,
    name: err.name || 'Error',
    message: err.message || `${err}`,
    status: err.status || 500,
  });
});
