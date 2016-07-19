/*
 * Copyright (c) 2014-1016 Tom Shawver
 */

'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const path = require('path')
const mod = require('module')

chai.use(chaiAsPromised)
global.should = chai.should()

// importing files with ../../../../../.. makes my brain hurt
process.env.NODE_PATH = path.join(__dirname, '..') + path.delimiter + (process.env.NODE_PATH || '')
mod._initPaths()
