'use strict';

var expect = require('chai').expect;
var rewire = require('rewire');
var Cache = rewire('../index.js');

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

describe('cache', function() {
  var cache = new Cache({ keyPrefix: 'test' }, { maxExpiration: 900 });

  it('should have various methods', function(){
    expect(cache).to.respondTo('get');
    expect(cache).to.respondTo('utilGet');
    expect(cache).to.respondTo('getMulti');
    expect(cache).to.respondTo('set');
    expect(cache).to.respondTo('del');
  });

  describe('execute methods', function() {
    it('should set/get something in the cache', function(done) {
      cache.set('foo', 'bar', 20)
        .then(function (setResult1) {
          return cache.get('foo');
        })
        .then(function (getResult1) {
          expect(getResult1).to.eq('bar');
          return cache.set('foo', 'bas', 20);
        })
        .then(function (setResult2) {
          return cache.get('foo');
        })
        .then(function (getResult2) {
          expect(getResult2).to.eq('bas');
          done();
        });
    });

    it('should set/utilGet something in the cache', function(done) {
      cache.set('foo', 'bar', 20)
        .then(function (setResult) {
          return cache.utilGet('test' + 'foo');
        })
        .then(function (utilGetResult) {
          expect(utilGetResult).to.eq('bar');
          done();
        }, function (utilGetError) {
          throw new Error(utilGetError);
        });
    });

    it('should set/multiGet something in the cache', function(done) {
      cache.set('foo', 'bar', 20)
        .then(function (setResult1) {
          return cache.set('fos', 'bas', 20);
        })
        .then(function (setResult2) {
          return cache.getMulti(['testfoo', 'testfos']);
        })
        .then(function (getMultiResult) {
          expect(getMultiResult.testfoo).to.eq('bar');
          expect(getMultiResult.testfos).to.eq('bas');
          done();
        });
    });

    it('should del something in the cache', function(done) {
      cache.set('foo', 'bar', 20)
        .then(function (setResult) {
          return cache.del('foo');
        })
        .then(function (delResult) {
          return cache.get('foo');
        }, function (delError) {
          throw delError;
        })
        .then(function (getResult) {
          done();
        }, function (getError) {
          throw getError;
        });
    });

    it('should return undefined if attempting to get something that does not exist', function(done) {
      var keyName = 'test-' + Date.now().toString();
      cache.get(keyName)
        .then(function (getResult) {
          done();
        }, function (getError) {
          throw getError;
        });
    });

    it('should return false if attempting to del something that does not exist', function(done) {
      var keyName = 'test-' + Date.now().toString();
      cache.del(keyName)
        .then(function (delResult) {
          done();
        }, function (delError) {
          throw delError;
        });
    });

    it('should limit the expiration value', function(done){
      expect(function(){
        cache.set('foo', 'bar', 10000000)
          .then(function (result) {},
          function (err) {});
      }).to.throw(Error);
      done();
    });

  });

  describe('mock rejections', function() {

    Cache.__with__({
      'Memcached': MockCacheRejected
    })(function () {
      var cacheRejected = new Cache();

      it('get', function (done) {
        cacheRejected.get('test')
          .then(function (resp) {
            throw new Error('Succeeded but expected fail');
          }, function (err) {
            done();
          });
      });

      it('set', function (done) {
        cacheRejected.set('test', 'this', 1000)
          .then(function (resp) {
            throw new Error('Succeeded but expected fail');
          }, function (err) {
            done();
          });
      });
    });

  });

});
