# mocha-axios

HTTP assertions for [mocha](#) using [axios](#).

## About

This is a simplified HTTP testing library designed to decrease the amount of time you spend writing end-to-end tests.
Designed to drop into Mocha TDD tests, backed by [axios](#), written with ES6 `async/await`.

## Installation

```sh
$ npm install --save-dev mocha mocha-axios
```

## Usage

```js
const app = require('./example-app')
const integration = require('mocha-axios');

describe('some-awesome-API', function () {
  it('should login correctly', integration({
    app,
    req: {
      method: 'POST',
      url: '/login',
      data: {
        method: 'email',
        email: 'james@jdrydn.com',
        password: 'correct-horse-battery-staple',
      },
    },
    res: {
      status: 200,
      headers: {
        'X-Auth-Token': 'e409413fd5b4bad63f0ee4093b0b0e9b',
      },
      data: {
        user: {
          id: '1',
          username: 'jdrydn',
        },
      },
    },
  }));
});
```

## API

```js
integration({

  // Any "app" that can be passed into http.createServer
  // For integration tests this is an express API
  app,
  // app: express(),

  // The request object should be an object that can be dropped into axios
  // See https://www.npmjs.com/package/axios#request-config
  req: {
    method: 'GET',
    url: '/',
    params: { one: 'two' },
  },

  // The response object is a similar-ish axios response object
  res: {
    // Include a status property to check the status of the response
    status: 200,

    // Include a headers property to check individual headers of the response
    headers: {
      // Including a regex value to test it
      'Content-Type': /json/,
      // Include a string value to exact-match it
      'X-Powered-By': 'Express',
    },

    // Include a data property to check the body of the response
    // If you don't set the responseType in the req then JSON is assumed
    data: 'Hello, world!',
  },
})
```

## TODO

Support for before/after functions, especially for lazy Mocha usage, that accept promises (thanks to `await`):

```js
integration({
  app,
  before() {
    return changeUserPassword(1, 'correct-horse-battery-staple');
  },
  req: {
    method: 'POST',
    url: '/login',
    data: {
      method: 'email',
      email: 'james@jdrydn.com',
      password: 'correct-horse-battery-staple',
    },
  },
  res: {
    status: 200,
    headers: {
      'X-Auth-Token': 'e409413fd5b4bad63f0ee4093b0b0e9b',
    },
    data: {
      user: {
        id: '1',
        username: 'jdrydn',
        created_date: 'YESTERDAY',
      },
    },
  },
  after() {
    return changeUserPassword(1, 'voice-occasionally-let-giving');
  },
})
```

Support for custom properties, for common tasks like modifying the response object or mocking HTTP requests with
[nock](https://npm.im/nock):

```js
integration({
  app,
  req: {
    method: 'POST',
    url: '/login',
    data: {
      method: 'email',
      email: 'james@jdrydn.com',
      password: 'correct-horse-battery-staple',
    },
  },
  nock: {
    hostname: 'localhost:9200',
    req: {
      method: 'GET',
      url: '/production-index/user/1',
    },
    res: {
      status: 200,
      data: {
        _id: 1,
        _type: 'user',
        _source: { username: 'jdrydn', created_date: 'Wed Jun 07 2017 11:12:12 GMT+0100 (BST)' },
      },
    },
  },
  modify: {
    'user.created_date': 'YESTERDAY',
  },
  res: {
    status: 200,
    headers: {
      'X-Auth-Token': 'e409413fd5b4bad63f0ee4093b0b0e9b',
    },
    data: {
      user: {
        id: '1',
        username: 'jdrydn',
        created_date: 'YESTERDAY',
      },
    },
  },
})
```

## Questions?

- [Open an issue](https://github.com/jdrydn/mocha-axios) or [drop me a tweet](https://twitter.com/jdrydn) :sunglasses:
