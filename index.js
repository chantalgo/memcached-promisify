const _assign = require('lodash.assign');
let Memcached = require('memcached');

const MAX_EXPIRATION = 2592000;  // memcached's max exp in seconds (30 days)

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
  this.config = _assign({
    keyPrefix: '',
    cacheHost: 'localhost:11211'
  }, config);

  options = options || {};

  this._cache = new Memcached(this.config.cacheHost, options);
}

function getPromise(instance, method, key) {
  return new Promise((resolve, reject) => {
    const cb = (err, data) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(data);
      }
    };

    if (key) {
      instance._cache[method](key, cb);
    }
    else {
      instance._cache[method](cb);
    }
  });
}

function setPromise(instance, key, value, expires) {
  return new Promise((resolve, reject) => {
    instance._cache.set(key, value, expires, (err, data) => {
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
 * @returns {Promise}
 */
Cache.prototype.get = function(key) {
  return getPromise(this, 'get', `${this.config.keyPrefix}${key}`);
};

/**
 * get a cache item
 * @param {string} key - full prefixed cache key
 * @returns {Promise}
 */
Cache.prototype.utilGet = function(key) {
  return getPromise(this, 'get', key);
};

/**
 * get an object of cache items
 * @param {array} keys - an array of cache keys
 * @returns {Promise}
 */
Cache.prototype.getMulti = function(keys) {
  return getPromise(this, 'getMulti', keys);
};

/**
 * gets stats from memcached server
 * @returns {Promise}
 */
Cache.prototype.stats = function() {
  return getPromise(this, 'stats');
};

/**
 * set an item in the cache
 * @param {string} key - cache key
 * @param {string|number|Object} data - data to set in cache
 * @param {number} [expires=900] - expiration of data in seconds
 * @returns {Promise}
 */
Cache.prototype.set = function(key, data, expires){
  if ((new Date(expires * 1000).getTime() !== new Date(expires * 1000).getTime())){
    throw new Error('Cache.set: Expiration must be seconds or timestamp');
  }

  return setPromise(this, this.config.keyPrefix + key, data, expires);
};

/**
 * delete an item in the cache
 * @param {string} key - cache key
 * @returns {Promise}
 */
Cache.prototype.del = function(key) {
  return getPromise(this, 'del', this.config.keyPrefix + key);
};

/**
 * kill all connections
 */
Cache.prototype.end = function() {
  this._cache.end();
};

module.exports = Cache;
