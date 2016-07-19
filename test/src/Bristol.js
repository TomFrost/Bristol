/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

/* global describe,it,beforeEach,afterEach,before,after */
'use strict'

const log = require('src/Bristol')

let b

describe('Bristol', () => {
  beforeEach(() => {
    b = new log.Bristol()
  })
  describe('setSeverities', () => {
    it('creates functions for default severities', () => {
      const sevs = ['error', 'warn', 'info', 'debug', 'trace']
      sevs.forEach((s) => {
        b.should.have.property(s).and.is.a.function
      })
    })
    it('replaces default functions with new ones', () => {
      const oldSevs = ['error', 'warn', 'info', 'debug', 'trace']
      const newSevs = ['omg', 'uhoh', 'k', 'wtf', 'yo']
      b.setSeverities(newSevs)
      newSevs.forEach((s) => {
        b.should.have.property(s).and.is.a.function
      })
      oldSevs.forEach((s) => {
        b.should.not.have.property(s)
      })
    })
  })
  describe('origin', () => {
    it('gets the origin of this call', () => {
      const origin = log._getOrigin()
      origin.should.have.property('file').of.type('string').and.eql(__filename)
      origin.should.have.property('line').of.type('string')
    })
  })
  describe('targets', () => {
    it('returns a config chain with all properties', () => {
      const conf = b.addTarget(() => {})
      conf.should.have.property('withFormatter').of.type('function')
      conf.should.have.property('excluding').of.type('function')
      conf.should.have.property('onlyIncluding').of.type('function')
      conf.should.have.property('withLowestSeverity').of.type('function')
      conf.should.have.property('withHighestSeverity').of.type('function')
    })
    it('pushes log messages to the target', () => {
      const res = {}
      b.addTarget((opts, sev, date, msg) => {
        res.opts = opts
        res.sev = sev
        res.date = date
        res.msg = msg
      })
      b.error('Something died!', { omg: 'no' })
      res.should.have.property('opts')
      res.should.have.property('sev').and.eql('error')
      res.should.have.property('date').and.be.instanceof(Date)
      res.should.have.property('msg')
      const json = JSON.parse(res.msg)
      should.exist(json)
      json.should.have.property('file').and.eql(__filename)
    })
    it('observes severity boundaries on target', () => {
      const res = {}
      b.addTarget((opts, sev, date, msg) => {
        res.msg = msg
      }).withHighestSeverity('warn').withLowestSeverity('debug')
      b.error('oh no')
      res.should.not.have.property('msg')
      b.trace('omg')
      res.should.not.have.property('msg')
    })
    it('observes whitelist', () => {
      const res = {}
      b.addTarget((opts, sev, date, msg) => {
        res.msg = msg
      }).onlyIncluding({
        foo: ['bar', 'car'],
        hello: 'world'
      })
      b.info('hello!', {
        foo: 'car',
        hello: 'world'
      })
      b.trace('goodbye!', {
        foo: 'bar',
        hello: 'my ragtime gal'
      })
      res.should.have.property('msg').and.match(/world/)
    })
    it('observes blacklist', () => {
      const res = {}
      b.addTarget((opts, sev, date, msg) => {
        res.msg = msg
      }).excluding({
        foo: ['bar', 'car'],
        hello: 'world'
      })
      b.warn({
        foo: 'star',
        hello: 'nice to meet you'
      })
      b.debug({
        foo: 'car',
        hello: 'nice to meet you'
      })
      res.should.have.property('msg').and.match(/star/)
    })
    it('supports a custom formatter', () => {
      const res = {}
      b.addTarget((opts, sev, date, msg) => {
        res.msg = msg
      }).withFormatter((opts, sev, date, elems) => {
        res.opts = opts
        res.sev = sev
        res.date = date
        res.elems = elems
        return 'foo'
      }, { cow: 'moo' })
      b.trace('hello')
      res.should.have.property('msg').and.eql('foo')
      res.should.have.property('opts').and.containEql({cow: 'moo'})
      res.should.have.property('sev').and.eql('trace')
      res.should.have.property('date').and.be.instanceof(Date)
      res.should.have.property('elems').and.be.an.Array
      res.elems.length.should.be.above(1)
    })
    it('logs to multiple targets', () => {
      let one = 0
      let two = 0
      b.addTarget(() => { one++ })
      b.addTarget(() => { two++ })
      b.log('trace', 'hello')
      one.should.eql(1)
      two.should.eql(1)
    })
  })
  describe('transforms', () => {
    it('applies a transform to an element', () => {
      let res = ''
      b.addTarget((opts, sev, date, msg) => {
        res = msg
      })
      b.addTransform((elem) => {
        if (elem.foo) {
          elem.foo = 'star'
          return elem
        }
        return null
      })
      b.error({
        cow: 'moo',
        foo: 'bar'
      })
      res = JSON.parse(res)
      should.exist(res)
      res.should.containEql({ foo: 'star' })
      res.should.containEql({ file: __filename })
    })
    it('stops running transforms when successful', () => {
      let res = ''
      b.addTarget((opts, sev, date, msg) => {
        res = msg
      })
      b.addTransform((elem) => {
        if (elem.foo) {
          elem.foo = 'star'
          return elem
        }
        return null
      })
      b.addTransform((elem) => {
        if (elem.cow) {
          elem.cow = 'neigh'
          return elem
        }
        return null
      })
      b.error({
        cow: 'moo',
        foo: 'bar'
      })
      res = JSON.parse(res)
      should.exist(res)
      res.should.containEql({foo: 'star'})
      res.should.containEql({cow: 'moo'})
    })
  })
  describe('globals', () => {
    it('allows global variables to be added', () => {
      let res = ''
      b.addTarget((opts, sev, date, msg) => {
        res = msg
      })
      b.setGlobal('foo', 'bar')
      b.debug('test')
      should.exist(res)
      res.should.match(/foo/).and.match(/bar/)
    })
    it('allows global variables to be removed', () => {
      let res = ''
      b.addTarget((opts, sev, date, msg) => {
        res = msg
      })
      b.setGlobal('foo', 'bar')
      b.deleteGlobal('foo')
      b.debug('test')
      should.exist(res)
      res.should.not.match(/foo/)
    })
    it('executes value as function when log is called', () => {
      let res = ''
      b.addTarget((opts, sev, date, msg) => {
        res = msg
      })
      b.setGlobal('foo', () => { return 'bar' })
      b.trace('test')
      should.exist(res)
      res.should.match(/bar/)
    })
  })
  describe('events', () => {
    it('fires "log" with each message', (done) => {
      b.on('log', (arg) => {
        should.exist(arg)
        arg.should.have.property('severity').and.eql('error')
        done()
      })
      b.error('test')
    })
    it('fires "log:severity" with each message', (done) => {
      b.on('log:error', (arg) => {
        should.exist(arg)
        arg.should.have.property('severity').and.eql('error')
        done()
      })
      b.error('test')
    })
  })
})
