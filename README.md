# mocha-axios

[![NPM](https://badge.fury.io/js/mocha-axios.svg)](https://www.npmjs.com/package/mocha-axios)
[![Tests](https://github.com/jdrydn/mocha-axios/workflows/Tests/badge.svg?branch=master&event=push)](https://github.com/jdrydn/mocha-axios/actions)

HTTP assertions for [mocha](https://www.npmjs.com/package/mocha) using [axios](https://www.npmjs.com/package/axios).

## About

This is a simplified HTTP testing library designed to decrease the amount of time you spend writing end-to-end tests.
Designed to drop into `mocha` tests, backed by `axios`, written with ES6 `async/await`.

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

  // You can specify a before function, which can return a Promise, to execute before anything actually happens
  before() {},
  // And you can specify a after function, which can return a Promise, to execute after all assertions have been made
  after() {},
})
```

## Extensions

You can optionally write your own extensions for `mocha-axios`, by registering them globally like so:

```js
const integration = require('mocha-axios');

integration.with('auth', {
  before(username, req) {
    req.headers['x-auth-token'] = createSignedTokenFor(username);
  },
});

it('should fetch Malcom\'s inbox', integration({
  app,
  auth: 'tuckerm@gov.uk',
  req: {
    method: 'GET',
    url: '/user/2321/inbox',
  },
  res: {
    status: 200,
  },
}));
```

### modify

To make it easier to mock HTTP endpoints where the data may change over time, there's a way to mock certain values in
the response data to fixed values. **Please note:** this will only overwrite values that have the same type, e.g.
`strings` `numbers` etc, in order to correctly return errors regarding missing properties / unusual properties!

This requires `lodash`, either the entire library (if you're already using it) or the two individually packaged
`_.get` `_.set`, so don't forget to install them (with `--save-dev` if you're not going to use it yourself!)

```js
const integration = require('mocha-axios');

// Set res-modify to anything you want
integration.with('res-modify', require('mocha-axios/withModify'));

it('should fetch a member profile', integration({
  app,
  req: {
    method: 'GET',
    url: '/member/2321/',
  },
  res: {
    status: 200,
    modify: {
      'user.id': 'some-id',
      'user.created_date': 'YESTERDAY',
    },
    data: {
      user: {
        id: 1,
        username: 'jdrydn',
        created_date: 'YESTERDAY',
      },
    },
  },
}));
```

A list of known extensions is coming soon!

## More

- [Open an issue](https://github.com/jdrydn/mocha-axios) or [drop me a tweet](https://twitter.com/jdrydn) :sunglasses:
