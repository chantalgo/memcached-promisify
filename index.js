'use strict';

var assert = require('assert');
var Memcached = require('memcached');
var Promise = require('promise');
var logger = console;

var cacheHostInstances = {};
var MAX_EXPIRATION = 2592000;  // memcached's max exp in seconds (30 days)

function Cache(keyPrefix, cacheHost, options) {
  this.keyPrefix = keyPrefix || '';
  this.cacheHost = cacheHost || 'localhost:11211';

  if (!cacheHostInstances.hasOwnProperty(this.cacheHost)) {
    logger.log('creating memcached instance for cache host: ', this.cacheHost);

    options = options || {};

    if (options.hasOwnProperty('maxExpiration')) {
      MAX_EXPIRATION = options.maxExpiration;
    }
    else {
      options.maxExpiration = MAX_EXPIRATION;
    }

    cacheHostInstances[this.cacheHost] = new Memcached(this.cacheHost, options);
  }

  this._cache = cacheHostInstances[this.cacheHost];
}

function getPromise(instance, method, key) {
  return new Promise(function (resolve, reject) {
    instance._cache[method](key, function (err, data) {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });
}

function setPromise(instance, key, value, expires) {
  return new Promise(function (resolve, reject) {
    instance._cache.set(key, value, expires, function (err, data) {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });
}

Cache.prototype.get = function(key){
  return getPromise(this, 'get', this.keyPrefix + key);
};

Cache.prototype.utilGet = function(key) {
  return getPromise(this, 'get', key);
};

Cache.prototype.getMulti = function(keys) {
  return getPromise(this, 'getMulti', keys);
};

Cache.prototype.set = function(key, value, expires){
  assert((expires <= MAX_EXPIRATION), "Cache.set: Expiration must be no greater than " + MAX_EXPIRATION + " seconds.");
  return setPromise(this, this.keyPrefix + key, value, expires);
};

Cache.prototype.del = function(key) {
  return getPromise(this, 'del', this.keyPrefix + key);
};

exports.Cache = Cache;