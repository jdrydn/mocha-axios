const assert = require('assert');
const axios = require('axios');
const extend = require('deep-extend');
const http = require('http');
const ms = require('ms');

const extensions = {
  beforeFns: {},
  eachFns: {},
  props: [],
  afterFns: {},
};

module.exports = function (opts) {
  return async function () {
    if (!opts || !opts.app) throw new Error('Missing `app` from opts');
    if (!opts.req) throw new Error('Missing `req` from opts');
    if (!opts.res) throw new Error('Missing `res` from opts');

    // If this test needs to adjust it's timeout
    if (opts.timeout) this.timeout(ms(opts.timeout)); // eslint-disable-line no-invalid-this

    const req = extend({ responseType: 'json' }, opts.defaults || {}, opts.req);

    // Handle generic before() functions
    if (typeof opts.before === 'function') await opts.before({
      req, res: null,
      opts: Object.assign({}, opts, { before: null, after: null }),
    });

    // Handle "before" items if the relevant property is found
    for (const prop in extensions.beforeFns) {
      if (opts.hasOwnProperty(prop) && typeof extensions.beforeFns[prop] === 'function') {
        await extensions.beforeFns[prop].call(null, opts[prop], req, opts); // eslint-disable-line no-await-in-loop
      }
    }

    const server = await startServer(opts.app);

    const res = await axios.request(Object.assign(req, {
      baseURL: `http://127.0.0.1:${server.address().port}/`,
      maxRedirects: 0,
      validateStatus: null,
    }));

    server.close();

    // Handle "each" items on every request
    for (const prop in extensions.eachFns) {
      /* istanbul ignore else */
      if (typeof extensions.eachFns[prop] === 'function') {
        await extensions.eachFns[prop].call(null, req, res, opts); // eslint-disable-line no-await-in-loop
      }
    }

    // Handle "after" items if the relevant property is found
    for (const prop in extensions.afterFns) {
      if (opts.hasOwnProperty(prop) && typeof extensions.afterFns[prop] === 'function') {
        await extensions.afterFns[prop].call(null, opts[prop], req, opts); // eslint-disable-line no-await-in-loop
      }
    }

    if (opts.res.status) assert.equal(res.status, opts.res.status, 'Incorrect response status');
    if (opts.res.headers) assertResHeaders(res.headers, opts.res.headers);

    if (opts.res.data) {
      if (req.responseType === 'json') assert.deepEqual(res.data, opts.res.data, 'Incorrect response JSON');
      else assert.equal(res.data, opts.res.data, 'Incorrect response body');
    }

    // Handle generic after() functions
    if (typeof opts.after === 'function') await opts.after({
      req, res,
      opts: Object.assign({}, opts, { before: null, after: null }),
    });
  };
};

function startServer(app) {
  const server = http.createServer(app);

  return new Promise((resolve, reject) => {
    /* istanbul ignore next */
    const timer = setTimeout(() => onceError(new Error('Failed to start server')), 1000);

    /* istanbul ignore next */
    function onceError(err) {
      clearTimeout(timer);
      server.removeListener('listening', onceListening);
      reject(err);
    }
    function onceListening() {
      clearTimeout(timer);
      server.removeListener('error', onceError);
      resolve(server);
    }

    server.once('error', onceError);
    server.once('listening', onceListening);
    server.listen(0, '127.0.0.1');
  });
}

function assertResHeaders(actual, expected) {
  /**
   * Pulled from https://github.com/visionmedia/supertest/blob/master/lib/test.js
   * Superagent does some of the best assertions I've ever seen
   */
  Object.keys(expected).forEach(function eachResHeader(key) {
    const actualValue = actual[key.toLowerCase()];
    if (typeof actualValue === 'undefined') throw new Error(`Expected "${key.toLowerCase()}" header`);

    const expectedValue = expected[key];
    // This check handles header values that may be a String or single element Array
    if ((actualValue instanceof Array && actualValue.toString() === expectedValue) || expectedValue === actualValue) {
      return;
    }
    if (expectedValue instanceof RegExp) {
      if (!expectedValue.test(actualValue)) {
        throw new Error(`Expected "${key}" header matching ${expectedValue.toString()}, got "${actualValue}"`);
      }
    } else {
      throw new Error(`Expected "${key}" header equal to "${expectedValue}", got "${actualValue}"`);
    }
  });
}

module.exports.with = function (prop, { before, after, each }) {
  if (!prop || [ 'app', 'req', 'res' ].indexOf(prop) >= 0) throw new Error('Invalid property name');

  if (extensions.props.indexOf(prop) >= 0) throw new Error(`Property "${prop}" has already been registered`);
  extensions.props.push(prop);

  if (typeof each === 'function') {
    extensions.eachFns[prop] = each;
  } else {
    if (typeof before === 'function') extensions.beforeFns[prop] = before;
    if (typeof after === 'function') extensions.afterFns[prop] = after;
  }
};
