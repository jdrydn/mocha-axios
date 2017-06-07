describe('mocha-axios', function () {
  const app = require('./example-app');
  const assert = require('assert');
  const integration = require('./integration');

  it('should throw an error if the app is missing', () => {
    return integration({ app: 0, req: 0, res: 0 })().catch(err => {
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Missing `app` from opts');
    });
  });
  it('should throw an error if the req is missing', () => {
    return integration({ app: 1, req: 0, res: 0 })().catch(err => {
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Missing `req` from opts');
    });
  });
  it('should throw an error if the res is missing', () => {
    return integration({ app: 1, req: 1, res: 0 })().catch(err => {
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Missing `res` from opts');
    });
  });

  it('should execute a GET request, checking status & body', integration({
    app,
    req: { method: 'GET', url: '/' },
    res: { status: 200, data: 'eps1.0_hellofriend.mov' },
  }));

  it('should execute a GET request, checking headers & body', integration({
    app,
    req: { method: 'GET', url: '/text', responseType: 'text' },
    res: { headers: { 'content-type': /text\/plain/ }, data: 'eps1.1_ones-and-zer0es.mpeg' },
  }));

  it('should execute a POST request, checking status & headers', integration({
    app,
    req: {
      method: 'POST',
      url: '/'
    },
    res: {
      status: 200,
      headers: {
        'X-Powered-By': 'Express',
      },
    },
  }));

  it('should execute a POST request, checking status & body', integration({
    app,
    req: {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        host: 'localhost',
        'user-agent': 'integration-test',
      },
      url: '/echo/',
      params: {
        one: 'eps1.0_hellofriend.mov',
        two: 'eps1.1_ones-and-zer0es.mpeg',
      },
      data: {
        three: 'eps1.2_d3bug.mkv',
        four: 'eps1.3_da3m0ns.mp4',
      },
    },
    res: {
      status: 200,
      data: {
        method: 'DELETE',
        url: '/echo/?one=eps1.0_hellofriend.mov&two=eps1.1_ones-and-zer0es.mpeg',
        path: '/echo/',
        headers: {
          accept: 'application/json',
          connection: 'close',
          'content-length': '56',
          'content-type': 'application/json;charset=utf-8',
          host: 'localhost',
          'user-agent': 'integration-test',
        },
        qs: {
          one: 'eps1.0_hellofriend.mov',
          two: 'eps1.1_ones-and-zer0es.mpeg',
        },
        body: {
          three: 'eps1.2_d3bug.mkv',
          four: 'eps1.3_da3m0ns.mp4',
        },
      },
    },
  }));

  it('should execute a GET request, with before and after functions', function () {
    let count = 0;
    integration({
      app,
      req: { method: 'GET', url: '/' },
      res: { status: 200, data: 'eps1.0_hellofriend.mov' },
      before() {
        count += 1;
      },
      after() {
        count += 1;
      },
    })().then(() => assert.equal(count, 2, 'Both functions did not run as expected'));
  });

  describe('assertResHeaders', function () {
    it('should throw if a response header is missing', function () {
      return integration({
        app,
        req: { method: 'POST', url: '/' },
        res: { headers: { 'X-Vanity': 'Follow me on Twitter? https://twitter.com/jdrydn' } },
      })().catch(err => {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Expected "x-vanity" header');
      });
    });

    it('should throw if a response header is regex and invalid', function () {
      return integration({
        app,
        req: { method: 'POST', url: '/' },
        res: { headers: { 'content-type': /text/ } },
      })().catch(err => {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Expected "content-type" header matching /text/, got "application/json; charset=utf-8"'); // eslint-disable-line
      });
    });

    it('should throw if a response header is invalid', function () {
      return integration({
        app,
        req: { method: 'POST', url: '/' },
        res: { headers: { 'content-type': 'text' } },
      })().catch(err => {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'Expected "content-type" header equal to "text", got "application/json; charset=utf-8"'); // eslint-disable-line
      });
    });
  });

  describe('#with', function () {
    it('should throw an error if the property is invalid', function () {
      let err = null;
      try { integration.with('app', {}); }
      catch (e) { err = e; }
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Invalid property name');
    });

    it('should register a new before command', function () {
      integration.with('squared', {
        before(value, req, opts) {
          opts.squared = value * value;
        }
      });
    });

    it('should register a new after command', function () {
      integration.with('tripled', {
        after(value, req, opts) {
          opts.tripled = value * value * value;
        }
      });
    });

    it('should throw an error if the property has already been registered', function () {
      let err = null;
      try { integration.with('squared', {}); }
      catch (e) { err = e; }
      assert.ok(err instanceof Error);
      assert.equal(err.message, 'Property "squared" has already been registered');
    });

    it('should execute running the before/after functions', function () {
      const opts = {
        app,
        req: { method: 'POST', url: '/' },
        res: { headers: { 'X-Powered-By': 'Express' } },
        squared: 2,
        tripled: 2,
      };

      return integration(opts)().then(() => {
        assert.equal(opts.squared, 4);
        assert.equal(opts.tripled, 8);
      });
    });

    it('should register a new each command', function () {
      integration.with('at-least-one', {
        each(req, res, opts) {
          opts.once = (opts.once || 0) + 1;
        }
      });
    });

    it('should execute running the each function', function () {
      const opts = {
        app,
        req: { method: 'POST', url: '/' },
        res: { headers: { 'X-Powered-By': 'Express' } },
        once: 2,
      };

      return integration(opts)().then(() => {
        assert.equal(opts.once, 3);
      });
    });
  });

  describe('#withModify', function () {
    integration.with('res.modify', require('./withModify'));

    it('should execute a GET request, checking status & body', integration({
      app,
      req: { method: 'GET', url: '/' },
      res: { status: 200, data: 'eps1.0_hellofriend.mov' },
    }));

    it('should execute a POST request, modifying the body, checking status & body', integration({
      app,
      req: {
        method: 'GET',
        headers: {
          accept: 'application/json',
          host: 'localhost',
          'user-agent': 'integration-test',
        },
        url: '/echo/',
        params: {
          one: 'eps1.0_hellofriend.mov',
          two: 'eps1.1_ones-and-zer0es.mpeg',
        },
        data: {
          three: 'eps1.2_d3bug.mkv',
          four: 'eps1.3_da3m0ns.mp4',
        },
      },
      res: {
        status: 200,
        modify: {
          'headers["content-type"]': 'binary-signals;1/0',
          'music': 'good-intentions',
        },
        data: {
          method: 'GET',
          url: '/echo/?one=eps1.0_hellofriend.mov&two=eps1.1_ones-and-zer0es.mpeg',
          path: '/echo/',
          headers: {
            accept: 'application/json',
            connection: 'close',
            'content-length': '56',
            'content-type': 'binary-signals;1/0',
            host: 'localhost',
            'user-agent': 'integration-test',
          },
          qs: {
            one: 'eps1.0_hellofriend.mov',
            two: 'eps1.1_ones-and-zer0es.mpeg',
          },
          body: {
            three: 'eps1.2_d3bug.mkv',
            four: 'eps1.3_da3m0ns.mp4',
          },
        },
      },
    }));
  });
});
