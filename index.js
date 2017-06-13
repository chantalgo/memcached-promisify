'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var Memcached = require('memcached');

var MAX_EXPIRATION = 2592000;  // memcached's max exp in seconds (30 days)

/**
 * Cache
 * @constructor
 * @param {Object} config - cache key prefix
 * @param {string} [config.keyPrefix] - cache key prefix
 * @param {string} [config.cacheHost] - cache host url
 * @param {Object} [options] - options passed to memcached
 *
 * @example
 *    new Cache('prefix', 'host');
 *
 */
function Cache(config, options) {
  this.config = _.assign({
    keyPrefix: '',
    cacheHost: 'localhost:11211'
  }, config);

  options = options || {};

  if (!options.hasOwnProperty('maxExpiration')) {
    options.maxExpiration = MAX_EXPIRATION;
  }

  this.config.maxExpiration = options.maxExpiration;

  console.log('creating memcached instance for cache host:', this.config.cacheHost);
  this._cache = new Memcached(this.config.cacheHost, options);
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

/**
 * get a cache item
 * @param {string} key - cache key
 */
Cache.prototype.get = function(key){
  return getPromise(this, 'get', this.config.keyPrefix + key);
};

/**
 * get a cache item
 * @param {string} key - full prefixed cache key
 */
Cache.prototype.utilGet = function(key) {
  return getPromise(this, 'get', key);
};

/**
 * get an object of cache items
 * @param {array} keys - an array of cache keys
 */
Cache.prototype.getMulti = function(keys) {
  return getPromise(this, 'getMulti', keys);
};

/***
 * Gets stats result. 
 * @returns {array} single-item array containing an object with a slew of key/values
 */
Cache.prototype.stats = function() {
  var _this = this;
  return new Promise(function (resolve, reject) {
    _this._cache['stats'](function (err, data) {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    });
  });
};

/**
 * set an item in the cache
 * @param {string} key - cache key
 * @param {string|number|Object} data - data to set in cache
 * @param {number} [expires=900] - expiration of data in seconds
 */
Cache.prototype.set = function(key, data, expires){
  if (expires > this.config.maxExpiration) {
    throw new Error('Cache.set: Expiration must be no greater than ' + this.config.maxExpiration + ' seconds.');
  }

  return setPromise(this, this.config.keyPrefix + key, data, expires);
};

/**
 * delete an item in the cache
 * @param {string} key - cache key
 */
Cache.prototype.del = function(key) {
  return getPromise(this, 'del', this.config.keyPrefix + key);
};

module.exports = Cache;