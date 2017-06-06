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
      body: {
        user: {
          id: '1',
          username: 'jdrydn',
        },
      },
    },
  }));
});
```

### In Detail

```js
integration({

  // Any "app" that can be passed into http.createServer
  // For integration tests this is an express API
  app,
  // app: express(),

  // The request object should be an axios compatible object
  // See https://www.npmjs.com/package/axios#request-config
  req: { method: 'GET', url: '/' },

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
    data: 'Hello, world!',
  },
})
```
