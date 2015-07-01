# memcached-promisify

Memcached promisified wrapper library

## installation

```shell
npm install memcached-promisify --save
```

## usage
```shell
var mp = require('memcached-promisify');
var cache = new mp.Cache();
// OR...
var cache = new (require('memcached-promisify').Cache)();

cache.set('foo', 'bar', 20)
    .then(function (result) {
        // successful set...
    }, function (err) {
        // something happened...
    });
```

## options

One and/or both of the following can be passed when instantiating:

* cache key prefix
* cache host (for example, an Elasticache host, or defaults to localhost:11211)
* memcached options (see https://www.npmjs.com/package/memcached#options)

```shell
var mp = require('memcached-promisify');
var cache1 = new mp.Cache('prefix'); // uses localhost:11211
var cache2 = new mp.Cache('prefix', 'other.host.com'); // specific cache host
```

## tests

Run the tests
```shell
grunt test
```
