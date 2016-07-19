/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

/* global describe,it,beforeEach,afterEach,before,after */
'use strict'

const consoleTarget = require('src/targets/console')

let consoleBuffer = ''
let oldConsole

const clog = (msg) => {
  consoleBuffer = msg
}

describe('Console Target', () => {
  after(() => {
    console.log = oldConsole
  })
  it('prints the supplied message', () => {
    oldConsole = console.log
    console.log = clog
    consoleTarget({}, 'debug', new Date(), 'foo')
    consoleBuffer.should.eql('foo')
    console.log = oldConsole
  })
})
