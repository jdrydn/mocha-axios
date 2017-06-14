const { _get, _set } = (function fetchLodashFunctions() { // eslint-disable-line wrap-iife
  /* istanbul ignore next */
  try {
    const get = require('lodash.get');
    const set = require('lodash.set');
    return { _get: get, _set: set };
  } catch (err1) {
    try {
      const get = require('lodash/get');
      const set = require('lodash/set');
      return { _get: get, _set: set };
    } catch (err2) {
      throw new Error('Missing lodash (or standalone lodash) module(s): npm install --save-dev lodash.get lodash.set');
    }
  }
})();

module.exports.each = function (req, res, opts) {
  if (req.responseType !== 'json' || !res.data || !_get(opts, 'res.modify')) return;

  let modify = _get(opts, 'res.modify');
  if (typeof modify === 'function') modify = modify(res.data);
  if (typeof modify !== 'object') throw new Error('Invalid type for modify object');

  for (var prop in modify) {
    /* istanbul ignore else */
    if (modify.hasOwnProperty(prop)) {
      var value = _get(res.data, prop);
      if (value === null) continue; // eslint-disable-line no-continue
      if (typeof value !== typeof modify[prop]) continue; // eslint-disable-line no-continue
      _set(res.data, prop, modify[prop]);
    }
  }
};
