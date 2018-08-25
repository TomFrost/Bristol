/*
 * Bristol
 * Copyright 2014-2018 Tom Shawver
 */

/* global describe,it,before,should */
'use strict'

const commonInfoModel = require('src/formatters/commonInfoModel')

let msg

describe('CommonInfoModel Formatter', () => {
  before(() => {
    msg = commonInfoModel({}, 'debug', new Date(), [
      'hello',
      {foo: 'bar', hello: 'world'},
      new Error('Test error'),
      {obj: { str: 'hello' }}
    ])
    should.exist(msg)
  })
  it('starts with the date', () => {
    msg.should.match(/^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d/)
  })
  it('does not contain any newlines', () => {
    msg.should.not.match(/\n/)
  })
  it('stringifies object literals', () => {
    msg.should.not.match(/\[object Object]/)
    msg.should.match(/'str':'hello'/)
  })
})
