# memcached-promisify

Memcached promisified wrapper library

## Dev Requirements

[Node.js](http://nodejs.org/download/)

[grunt](http://gruntjs.com/)
```shell
$ npm install -g grunt-cli
```

## Dev Setup
```shell
$ npm install
```

## Grunt Tasks

Run tests
```shell
$ grunt
```

## Example Usage
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

## Options

One and/or both of the following can be passed when instantiating:

* cache key prefix
* cache host (for example, an Elasticache host, or defaults to localhost:11211)
* memcached options (see https://www.npmjs.com/package/memcached#options)

```shell
var mp = require('memcached-promisify');
var cache1 = new mp.Cache('prefix'); // uses localhost:11211
var cache2 = new mp.Cache('prefix', 'other.host.com'); // specific cache host
```
