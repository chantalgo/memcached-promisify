# memcached-promisify

Memcached promisified wrapper library

## installation

```shell
npm install memcached-promisify --save
```

## usage
```shell
var Cache = require('memcached-promisify');

var cache = new Cache();

cache.set('foo', 'bar', 20)
    .then(function (result) {
        // successful set...
    }, function (err) {
        // something happened...
    });
```

## options

The following can be passed when instantiating:

* an object with a cache key prefix and the cache host URL, both optional
* memcached options (see https://www.npmjs.com/package/memcached#options)

```shell
var Cache = require('memcached-promisify');

// uses cache host at localhost:11211 by default
var cache1 = new Cache({ 'keyPrefix': 'prefix' });

// specific cache host
var cache2 = new Cache({ 'keyPrefix': 'prefix', 'cacheHost': 'other.host.com' });
```

## tests

Run the tests
```shell
grunt test
```
