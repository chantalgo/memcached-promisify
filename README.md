# memcached-promisify-timestamp

Fork of [memcached-promisify](https://github.com/flightstats/memcached-promisify) Memcached promisified wrapper library that allows setting for timestamps in expiration date

## installation

```shell
npm install memcached-promisify-timestamp --save
```

## usage
```shell
const Cache = require('memcached-promisify-timestamp');

const cache = new Cache();

cache.set('foo', 'bar', 20)
    .then((result) => {
        // successful set...
    }, (err) => {
        // something happened...
    });
```

## options

The following can be passed when instantiating:

* an object with a cache key prefix and the cache host URL, both optional
* memcached options (see https://www.npmjs.com/package/memcached#options)

```shell
const Cache = require('memcached-promisify');

// uses cache host at localhost:11211 by default
const cache1 = new Cache({ 'keyPrefix': 'prefix' });

// specific cache host
const cache2 = new Cache({ 'keyPrefix': 'prefix', 'cacheHost': 'other.host.com' });
```

## tests

Run the tests
```shell
grunt test
```
