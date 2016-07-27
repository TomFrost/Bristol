/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

/* global describe,it,beforeEach,afterEach,before,after */
'use strict'

const file = require('src/targets/file')
const tmp = require('tmp')
const fs = require('fs')

let tmpFile

describe('File Target', () => {
  before((done) => {
    tmp.setGracefulCleanup()
    tmp.tmpName((err, path) => {
      if (err) throw err
      tmpFile = path
      done()
    })
  })
  it('writes the supplied message to a file', (done) => {
    file({file: tmpFile}, 'debug', new Date(), 'foo')
    setTimeout(() => {
      fs.readFile(tmpFile, {encoding: 'utf8'}, (err, data) => {
        should.not.exist(err)
        should.exist(data)
        data.should.eql('foo\n')
        done()
      })
    }, 500)
  })
})
