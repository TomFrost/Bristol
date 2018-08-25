/*
 * Bristol
 * Copyright 2014-2018 Tom Shawver
 */

/* global describe,it,should */
'use strict'

const json = require('src/formatters/json')

describe('JSON Formatter', () => {
  it('returns valid JSON with severity property', () => {
    let res = json({}, 'debug', new Date(), ['hello'])
    res = JSON.parse(res)
    should.exist(res)
    res.should.have.property('message').and.eql('hello')
  })
  it('supplies a valid date', () => {
    let res = json({}, 'debug', new Date(), ['hello'])
    res = JSON.parse(res)
    should.exist(res)
    res.should.have.property('date').and.match(/\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d/)
  })
  it('does not overwrite duplicate keys', () => {
    let res = json({}, 'debug', new Date(), [
      'hello',
      {foo: 'bar'},
      {foo: 'car'}
    ])
    res = JSON.parse(res)
    should.exist(res)
    res.should.have.property('foo').and.eql('bar')
    res.should.have.property('foo0').and.eql('car')
  })
  it('includes a stack trace for errors', () => {
    let res = json({}, 'debug', new Date(), [
      'hello',
      new Error('This is a test')
    ])
    res = JSON.parse(res)
    should.exist(res)
    res.should.have.property('stackTrace')
  })
  it('omits the messages object when there aren\'t any', () => {
    let res = json({}, 'debug', new Date(), [{foo: 'bar'}])
    res = JSON.parse(res)
    should.exist(res)
    res.should.not.have.property('messages')
  })
  it('allows meta keys to be customized', () => {
    const opts = {
      messageKey: 'desc',
      dateKey: 'when',
      severityKey: 'badness'
    }
    let res = json(opts, 'debug', new Date(), ['omg'])
    res = JSON.parse(res)
    should.exist(res)
    res.should.have.property('desc').and.eql('omg')
    res.should.have.property('when')
    res.should.have.property('badness').and.eql('debug')
    res.should.not.have.property('message')
    res.should.not.have.property('date')
    res.should.not.have.property('severity')
  })
  it('allows date format to be customized', () => {
    const opts = {
      dateFormat: 'YY-MM-DD'
    }
    let res = json(opts, 'debug', new Date(), ['omg'])
    res = JSON.parse(res)
    should.exist(res)
    res.should.have.property('date').and.match(/\d\d-\d\d-\d\d/)
  })
})
