const assert = require('assert');
const axios = require('axios');
const extend = require('deep-extend');
const http = require('http');

// const extensions = {
//   beforeFns: {},
//   props: [],
//   afterFns: {},
// };

module.exports = function (opts) {
  return async function () {
    if (!opts || !opts.app) throw new Error('Missing `app` from opts');
    if (!opts.req) throw new Error('Missing `req` from opts');
    if (!opts.res) throw new Error('Missing `res` from opts');

    const req = extend({ responseType: 'json' }, opts.req);
    // const to_extend = extensions.props.filter(prop => opts.hasOwnProperty(prop));

    // if (to_extend.length) {
    //   // Handle "before" items
    //   for (let i = 0; i < to_extend.length; i += 1) {
    //     if (typeof extensions.beforeFns[to_extend[i]] === 'function') {
    //       await extensions.beforeFns[to_extend[i]].call(null, opts[to_extend[i]], req, opts); // eslint-disable-line no-await-in-loop
    //     }
    //   }
    // }

    const server = await startServer(opts.app);

    const res = await axios.request(Object.assign(req, {
      baseURL: `http://127.0.0.1:${server.address().port}/`,
      validateStatus: null,
    }));

    server.close();

    // if (to_extend.length) {
    //   // Handle "after" items
    //   for (let i = 0; i < to_extend.length; i += 1) {
    //     if (typeof extensions.afterFns[to_extend[i]] === 'function') {
    //       await extensions.afterFns[to_extend[i]].call(null, opts[to_extend[i]], res, opts); // eslint-disable-line no-await-in-loop
    //     }
    //   }
    // }

    if (opts.res.status) assert.equal(res.status, opts.res.status, 'Incorrect response status');
    if (opts.res.headers) assertResHeaders(res.headers, opts.res.headers);

    if (opts.res.data) {
      if (req.responseType === 'json') assert.deepEqual(res.data, opts.res.data, 'Incorrect response JSON');
      else assert.equal(res.data, opts.res.data, 'Incorrect response body');
    }
  };
};

function startServer(app) {
  const server = http.createServer(app);

  return new Promise((resolve, reject) => {
    /* istanbul ignore next */
    const timer = setTimeout(() => onceError(new Error('Failed to start server')), 1000);

    function onceListening() {
      clearTimeout(timer);
      server.removeListener('error', onceError);
      resolve(server);
    }
    /* istanbul ignore next */
    function onceError(err) {
      clearTimeout(timer);
      server.removeListener('listening', onceListening);
      reject(err);
    }

    server.listen(0, '127.0.0.1');
    server.once('listening', onceListening);
    server.once('error', onceError);
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

// module.exports.with = function (prop, { before, after }) {
//   if (!prop || [ 'app', 'req', 'res' ].indexOf(prop) >= 0) throw new Error('Invalid property name');
//   if (extensions.props.indexOf(prop) >= 0) throw new Error(`Property "${prop}" has already been registered`);
//
//   extensions.props.push(prop);
//   if (typeof before === 'function') extensions.beforeFns[prop] = before;
//   if (typeof after === 'function') extensions.afterFns[prop] = after;
// };

/**
//////////

// npm install --save-dev mocha-axios mocha-axios-nock

integration.with('nock', {
  before(value) {
    // configure nock, returning values

    return scope;
  },
});

const _get = require('lodash/get');
const _isPlainObject = require('lodash/isPlainObject');
const _set = require('lodash/set');

// npm install --save-dev mocha-axios mocha-axios-modify

integration.with('modify', {
  after(values, res, opts) {
    // configure nock, returning values

    if (res.data) {
      for (var prop in values) if (values.hasOwnProperty(prop)) {
        var value = _get(res.data, prop);
        if (value === null) continue;
        if (typeof value !== typeof values[prop]) continue;
        _set(res.data, prop, values[prop]);
      }
    }
  },
});
 */
