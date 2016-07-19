/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

/* global describe,it,beforeEach,afterEach,before,after */
'use strict'

const syslog = require('src/formatters/syslog')

let msg

describe('CommonInfoModel Formatter', () => {
  before(() => {
    msg = syslog({}, 'debug', new Date(), [
      'hello',
      {foo: 'bar', hello: 'world'},
      new Error('Test error')
    ])
    should.exist(msg)
  })
  it('starts with the date', () => {
    msg.should.be.of.type('string').and.match(/^\w\w\w \d\d? \d\d:\d\d:\d\d/)
  })
  it('does not contain any newlines', () => {
    msg.should.not.match(/\n/)
  })
})
