'use strict';

process.env.NODE_ENV = 'test';

var Cache = require('../').Cache;
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

describe('cache', function() {
  var cache = new Cache('test');

  describe('methods', function() {
    it('should have the method get', function() {
      expect(cache).to.respondTo('get');
    });

    it('should have the method utilGet', function() {
      expect(cache).to.respondTo('utilGet');
    });

    it('should have the method getMulti', function() {
      expect(cache).to.respondTo('getMulti');
    });

    it('should have the method set', function() {
      expect(cache).to.respondTo('set');
    });

    it('should have the method del', function() {
      expect(cache).to.respondTo('del');
    });
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
          console.error(delError);
          throw delError;
        })
        .then(function (getResult) {
          assert(!getResult);
          done();
        }, function (getError) {
          console.error(getError);
          throw getError;
        });
    });

    it('should return false if attempting to del something that does not exist', function(done) {
      var keyName = 'test-' + Date.now().toString();
      cache.del(keyName)
        .then(function (delResult) {
          expect(delResult).to.be.false;
          done();
        })
    });
  });

  describe('assertions', function() {
    it('should limit the expiration value', function(done){
      expect(function(){
        cache.set('foo', 'bar', 10000000)
          .then(function (result) {},
          function (err) {});
      }).to.throw(assert.AssertionError);
      done();
    });
  });
});
