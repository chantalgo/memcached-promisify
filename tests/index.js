const _get = require('lodash.get');
const _isempty = require('lodash.isempty');
const assert = require('assert');
const expect = require('chai').expect;
const rewire = require('rewire');
const Cache = rewire('../index.js');

/*
 * cache mockers
 */
function MockCacheRejected(host, options) {}
MockCacheRejected.prototype.get = function (key, cb) {
  return cb('Test get rejection');
};
MockCacheRejected.prototype.set = function (key, value, exp, cb) {
  return cb('Test set rejection');
};

describe('cache', () => {
  const cache = new Cache({ keyPrefix: 'test' }, { maxExpiration: 900 });

  it('should have various methods', () => {
    expect(cache).to.respondTo('get');
    expect(cache).to.respondTo('utilGet');
    expect(cache).to.respondTo('getMulti');
    expect(cache).to.respondTo('set');
    expect(cache).to.respondTo('del');
    expect(cache).to.respondTo('stats');
  });

  describe('execute methods', () => {

    it('should set/get something in the cache', (done) => {
      cache.set('foo', 'bar', 20)
        .then((setResult1) => {
          return cache.get('foo');
        })
        .then((getResult1) => {
          expect(getResult1).to.eq('bar');
          return cache.set('foo', 'bas', 20);
        })
        .then((setResult2) => {
          return cache.get('foo');
        })
        .then((getResult2) => {
          expect(getResult2).to.eq('bas');
          done();
        });
    });

    it('should set/utilGet something in the cache', (done) => {
      cache.set('foo', 'bar', 20)
        .then((setResult) => {
          return cache.utilGet('test' + 'foo');
        })
        .then((utilGetResult) => {
          expect(utilGetResult).to.eq('bar');
          done();
      }, (utilGetError) => {
          throw new Error(utilGetError);
        });
    });

    it('should set/multiGet something in the cache', (done) => {
      cache.set('foo', 'bar', 20)
        .then((setResult1) => {
          return cache.set('fos', 'bas', 20);
        })
        .then((setResult2) => {
          return cache.getMulti(['testfoo', 'testfos']);
        })
        .then((getMultiResult) => {
          expect(getMultiResult.testfoo).to.eq('bar');
          expect(getMultiResult.testfos).to.eq('bas');
          done();
        });
    });

    it ('should return stats response with non-zero number of items', (done) => {
      cache.set('herp', 'derp', 20)
        .then((setResult1) => {
          return cache.stats();
        })
        .then((stats) => {
          assert.ok(!_isempty(stats));
          assert.ok(_get(stats, '0.total_items', 0) > 0);
          done();
        });
    });

    it('should del something in the cache', (done) => {
      cache.set('foo', 'bar', 20)
        .then((setResult) => {
          return cache.del('foo');
        })
        .then((delResult) => {
          return cache.get('foo');
      }, (delError) => {
          throw delError;
        })
        .then((getResult) => {
          done();
      }, (getError) => {
          throw getError;
        });
    });

    it('should return undefined if attempting to get something that does not exist', (done) => {
      const keyName = `test-${Date.now().toString()}`;
      cache.get(keyName)
        .then((getResult) => {
          done();
      }, (getError) => {
          throw getError;
        });
    });

    it('should return false if attempting to del something that does not exist', (done) => {
      const keyName = `test-${Date.now().toString()}`;
      cache.del(keyName)
        .then((delResult) => {
          done();
      }, (delError) => {
          throw delError;
        });
    });

    it('Expiration value should be seconds or a timestamp', (done) => {
      expect(() => {
        cache.set('foo', 'bar', 'test')
          .then(function (result) {},
          function (err) {});
      }).to.throw(Error);
      done();
    });

  });

  describe('mock rejections', () => {

    Cache.__with__({
      'Memcached': MockCacheRejected
    })(() => {
      const cacheRejected = new Cache();

      it('get', (done) => {
        cacheRejected.get('test')
          .then((resp) => {
            throw new Error('Succeeded but expected fail');
        }, (err) => {
            done();
          });
      });

      it('set', (done) => {
        cacheRejected.set('test', 'this', 1000)
          .then((resp) => {
            throw new Error('Succeeded but expected fail');
        }, (err) => {
            done();
          });
      });
    });

  });

});
