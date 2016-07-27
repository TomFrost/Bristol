/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

/* global describe,it,beforeEach,afterEach,before,after */
'use strict'

const human = require('src/formatters/human')

let msg

describe('Human Formatter', () => {
  before(() => {
    msg = human({}, 'debug', new Date(), [
      'Hello!',
      {is_it: 'me', 'you\'re': 'looking for'},
      {file: __filename, line: 82},
      {obj: { str: 'hello' }}
    ])
  })
  it('outputs multiple lines', () => {
    msg.should.match(/\n/)
  })
  it('outputs the date', () => {
    msg.should.match(/^\D*\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d\D/)
  })
  it('outputs the severity, in uppercase', () => {
    msg.match(/DEBUG/)
  })
  it('outputs loose strings in line 1', () => {
    msg.should.match(/^[^\n]+Hello!/)
  })
  it('outputs file and line in line 1', () => {
    msg.should.match(/^[^\n]+human\.js:82/)
  })
  it('stringifies object literals', () => {
    msg.should.not.match(/\[object Object\]/)
    msg.should.match(/"str": "hello"/)
  })
})
