/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

/* global describe,it,beforeEach,afterEach,before,after */
'use strict'

const logglyTarget = require('src/targets/loggly')

describe('Loggly Target', () => {
  it('should successfully call the target', () => {
    const fn = () => {
      logglyTarget({
        token: 'Your-Token',
        username: 'Your-Username',
        password: 'Your-Password',
        subdomain: 'Your-Subdomain'
      }, 'debug', new Date(), 'foo')
    }
    fn.should.not.throw()
  })
  it('should fail with missing options', () => {
    const fn = () => {
      logglyTarget({}, 'debug', new Date(), 'foo')
    }
    fn.should.throw()
  })
})
