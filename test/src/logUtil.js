/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

/* global describe,it,beforeEach,afterEach,before,after */
'use strict'

const logUtil = require('src/logUtil')

describe('Util', () => {
  describe('matchesOneVal', () => {
    it('does not match when no equality matches', () => {
      const list = ['boo', 'poo', 'loo']
      const res = logUtil.matchesOneValue('foo', list)
      res.should.eql(false)
    })
    it('matches when an equality matches', () => {
      const list = ['boo', 'poo', 'foo']
      const res = logUtil.matchesOneValue('foo', list)
      res.should.eql(true)
    })
    it('does not match when no regex matches', () => {
      const list = [/boo/, /poo/, /loo/]
      const res = logUtil.matchesOneValue('foo', list)
      res.should.eql(false)
    })
    it('matches when a regex matches', () => {
      const list = [/boo/, /poo/, /foo/]
      const res = logUtil.matchesOneValue('foo', list)
      res.should.eql(true)
    })
    it('does not match when no function matches', () => {
      const list = [
        (elem) => elem === 'boo',
        (elem) => elem === 'poo'
      ]
      const res = logUtil.matchesOneValue('foo', list)
      res.should.eql(false)
    })
    it('matches when a function matches', () => {
      const list = [
        (elem) => elem === 'boo',
        (elem) => elem === 'foo'
      ]
      const res = logUtil.matchesOneValue('foo', list)
      res.should.eql(true)
    })
    it('does not match against a non-matching mixed list', () => {
      const list = ['boo', /poo/, (e) => e === 'loo']
      const res = logUtil.matchesOneValue('foo', list)
      res.should.eql(false)
    })
    it('matches against a matching mixed list', () => {
      const list = ['boo', /poo/, (e) => e === 'foo']
      const res = logUtil.matchesOneValue('foo', list)
      res.should.eql(true)
    })
    it('does not match against a single non-matching value', () => {
      const res = logUtil.matchesOneValue('foo', 'boo')
      res.should.eql(false)
    })
    it('matches against a single matching value', () => {
      const res = logUtil.matchesOneValue('foo', 'foo')
      res.should.eql(true)
    })
  })
  describe('matchesOneKey', () => {
    it('passes an unmatched 1:1 blacklist', () => {
      const blacklist = {
        foo: 'bar',
        hello: 'world'
      }
      const haystack = {
        fishSticks: 'awesome',
        foo: 'car',
        hello: 'to my little friend'
      }
      const blacklisted = logUtil.matchesOneKey(haystack, blacklist)
      blacklisted.should.eql(false)
    })
    it('fails a matched 1:1 blacklist', () => {
      const blacklist = {
        foo: 'bar',
        hello: 'world'
      }
      const haystack = {
        fishSticks: 'still awesome',
        foo: 'car',
        hello: 'world'
      }
      const blacklisted = logUtil.matchesOneKey(haystack, blacklist)
      blacklisted.should.eql(true)
    })
    it('passes an unmatched 1:many blacklist', () => {
      const blacklist = {
        foo: ['bar', 'car', 'scar', 'far'],
        hello: ['my lady', 'my honey', 'my ragtime gal']
      }
      const haystack = {
        fishSticks: 'increasingly awesome',
        foo: 'star',
        hello: 'world'
      }
      const blacklisted = logUtil.matchesOneKey(haystack, blacklist)
      blacklisted.should.eql(false)
    })
    it('fails a matched 1:many blacklist', () => {
      const blacklist = {
        foo: ['bar', 'car', 'scar', 'far'],
        hello: ['my lady', 'my honey', 'my ragtime gal']
      }
      const haystack = {
        fishSticks: 'increasingly awesomer',
        foo: 'car',
        hello: 'world'
      }
      const blacklisted = logUtil.matchesOneKey(haystack, blacklist)
      blacklisted.should.eql(true)
    })
    it('passes an unmatched blacklist with regexes', () => {
      const blacklist = {
        foo: /^.ar$/i,
        hello: ['is it me you\'re looking for?', /baby/g]
      }
      const haystack = {
        fishSticks: 'awesome++',
        foo: 'char',
        hello: 'world'
      }
      const blacklisted = logUtil.matchesOneKey(haystack, blacklist)
      blacklisted.should.eql(false)
    })
    it('fails a matched blacklist with regexes', () => {
      const blacklist = {
        foo: /^.ar$/i,
        hello: ['is it me you\'re looking for?', /baby/g]
      }
      const haystack = {
        fishSticks: 'awesome+=2',
        foo: 'char',
        hello: 'my baby'
      }
      const blacklisted = logUtil.matchesOneKey(haystack, blacklist)
      blacklisted.should.eql(true)
    })
    it('passes an unmatched blacklist with a function', () => {
      const blacklist = {
        foo: (val) => val === 'bar'
      }
      const haystack = {
        foo: 'car'
      }
      const blacklisted = logUtil.matchesOneKey(haystack, blacklist)
      blacklisted.should.eql(false)
    })
    it('fails a matched blacklist with a function', () => {
      const blacklist = {
        foo: (val) => val === 'bar'
      }
      const haystack = {
        foo: 'bar'
      }
      const blacklisted = logUtil.matchesOneKey(haystack, blacklist)
      blacklisted.should.eql(true)
    })
  })
  describe('matchesAllKeys', () => {
    it('fails when a key is missing', () => {
      const whitelist = {
        foo: 'bar',
        hello: 'world'
      }
      const haystack = {
        fishSticks: 'pretty cool',
        foo: 'bar'
      }
      const whitelisted = logUtil.matchesAllKeys(haystack, whitelist)
      whitelisted.should.eql(false)
    })
    it('fails an unmatched 1:1 whitelist', () => {
      const whitelist = {
        foo: 'bar',
        hello: 'world'
      }
      const haystack = {
        fishSticks: 'awesome',
        foo: 'bar',
        hello: 'to my little friend'
      }
      const whitelisted = logUtil.matchesAllKeys(haystack, whitelist)
      whitelisted.should.eql(false)
    })
    it('passes a matched 1:1 whitelist', () => {
      const whitelist = {
        foo: 'bar',
        hello: 'world'
      }
      const haystack = {
        fishSticks: 'still awesome',
        foo: 'bar',
        hello: 'world'
      }
      const whitelisted = logUtil.matchesAllKeys(haystack, whitelist)
      whitelisted.should.eql(true)
    })
    it('fails an unmatched 1:many whitelist', () => {
      const whitelist = {
        foo: ['bar', 'car', 'scar', 'far'],
        hello: ['my lady', 'my honey', 'my ragtime gal']
      }
      const haystack = {
        fishSticks: 'increasingly awesome',
        foo: 'scar',
        hello: 'world'
      }
      const whitelisted = logUtil.matchesAllKeys(haystack, whitelist)
      whitelisted.should.eql(false)
    })
    it('passes a matched 1:many whitelist', () => {
      const whitelist = {
        foo: ['bar', 'car', 'scar', 'far'],
        hello: ['my lady', 'my honey', 'my ragtime gal']
      }
      const haystack = {
        fishSticks: 'increasingly awesomer',
        foo: 'car',
        hello: 'my honey'
      }
      const whitelisted = logUtil.matchesAllKeys(haystack, whitelist)
      whitelisted.should.eql(true)
    })
    it('fails an unmatched whitelist with regexes', () => {
      const whitelist = {
        foo: /^.ar$/i,
        hello: ['is it me you\'re looking for?', /baby/g]
      }
      const haystack = {
        fishSticks: 'awesome++',
        foo: 'car',
        hello: 'world'
      }
      const whitelisted = logUtil.matchesAllKeys(haystack, whitelist)
      whitelisted.should.eql(false)
    })
    it('passes a matched whitelist with regexes', () => {
      const whitelist = {
        foo: /^.ar$/i,
        hello: ['is it me you\'re looking for?', /baby/g]
      }
      const haystack = {
        fishSticks: 'awesome+=2',
        foo: 'car',
        hello: 'my baby'
      }
      const whitelisted = logUtil.matchesAllKeys(haystack, whitelist)
      whitelisted.should.eql(true)
    })
  })
  describe('forEachObj', () => {
    it('runs once for each top-level element', () => {
      const obj = { one: 0, two: 0, three: 0 }
      let count = 0
      logUtil.forEachObj(obj, () => {
        count++
      })
      count.should.eql(3)
    })
    it('calls back for every element only once', () => {
      const obj = { one: 0, two: 0, three: 0 }
      logUtil.forEachObj(obj, (key, val) => {
        obj[key] = val + 1
      })
      obj.one.should.eql(1)
      obj.two.should.eql(1)
      obj.three.should.eql(1)
    })
    it('stops when breakLoop is called', () => {
      const obj = { one: 0, two: 0, three: 0 }
      logUtil.forEachObj(obj, (key, val, breakLoop) => {
        obj[key] = val + 1
        if (key === 'two') {
          breakLoop()
        }
      })
      obj.one.should.eql(1)
      obj.two.should.eql(1)
      obj.three.should.eql(0)
    })
  })
  describe('freeKey', () => {
    it('does not change the key if it doesn\'t exist', () => {
      const obj = { foo: 'bar', hello: 'world' }
      const result = logUtil.freeKey(obj, 'fishSticks')
      result.should.eql('fishSticks')
    })
    it('appends .0 if the key already exists', () => {
      const obj = { foo: 'bar', hello: 'world' }
      const result = logUtil.freeKey(obj, 'hello')
      result.should.eql('hello0')
    })
    it('increments until a free key is found', () => {
      const obj = { foo: 'bar', 'foo0': 'car', 'foo1': 'star' }
      const result = logUtil.freeKey(obj, 'foo')
      result.should.eql('foo2')
    })
    it('allows separator to be customized', () => {
      const obj = { foo: 'bar', foo_0: 'car' }
      const result = logUtil.freeKey(obj, 'foo', '_')
      result.should.eql('foo_1')
    })
    it('allows starting integer to be customized', () => {
      const obj = { foo: 'bar', foo_1: 'car' }
      const result = logUtil.freeKey(obj, 'foo', '_', 1)
      result.should.eql('foo_2')
    })
  })
  describe('nonObjToString', () => {
    it('converts valid values to string form', () => {
      logUtil.nonObjToString(undefined).should.eql('undefined')
      logUtil.nonObjToString(null).should.eql('null')
      logUtil.nonObjToString(5).should.eql('5')
      logUtil.nonObjToString('foo').should.eql('foo')
      logUtil.nonObjToString(true).should.eql('true')
      logUtil.nonObjToString(false).should.eql('false')
    })
    it('returns null for invalid values', () => {
      should.not.exist(logUtil.nonObjToString({}))
      should.not.exist(logUtil.nonObjToString(new Date()))
    })
  })
  describe('safeMerge', () => {
    it('shallow merges two objects with no like keys', () => {
      const obj = { one: 1, two: 2 }
      const obj2 = { three: 3, four: 4 }
      logUtil.safeMerge(obj, obj2)
      obj.should.have.property('one').and.eql(1)
      obj.should.have.property('two').and.eql(2)
      obj.should.have.property('three').and.eql(3)
      obj.should.have.property('four').and.eql(4)
      obj2.should.not.have.property('one')
    })
    it('chooses free keys on overlap', () => {
      const obj = { one: 1, two: 2 }
      const obj2 = { two: 2, three: 3 }
      logUtil.safeMerge(obj, obj2)
      obj.should.have.property('two').and.eql(2)
      obj.should.have.property('two0').and.eql(2)
    })
    it('supports freeKey\'s customizations', () => {
      const obj = { one: 1, two: 2 }
      const obj2 = { two: 2, three: 3 }
      logUtil.safeMerge(obj, obj2, '_', 2)
      obj.should.have.property('two_2').and.eql(2)
    })
  })
  describe('shallowMerge', () => {
    it('shallow merges two objects with no like keys', () => {
      const obj = { one: 1, two: 2 }
      const obj2 = { three: 3, four: 4 }
      logUtil.shallowMerge(obj, obj2)
      obj.should.have.property('one').and.eql(1)
      obj.should.have.property('two').and.eql(2)
      obj.should.have.property('three').and.eql(3)
      obj.should.have.property('four').and.eql(4)
      obj2.should.not.have.property('one')
    })
    it('overwrites keys on overlap', () => {
      const obj = { one: 1, two: 2 }
      const obj2 = { two: 5, three: 3 }
      logUtil.shallowMerge(obj, obj2)
      obj.should.have.property('two').and.eql(5)
    })
  })
})
