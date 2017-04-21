'use strict'

const { Suite } = require('benchmark')
const suite = new Suite()

const json = require('src/formatters/json')

const time = new Date()
const error = new Error('blerg')
const elems = [
  { a: 'b', c: 'd', e: { hello: 'world' } },
  { arg: 1, error: error, blerg: new Date() },
  { f: true, g: ['h', 5, 'i', { j: 'k' }] }
]

suite.add('json formatter', function() {
  json({}, 'debug', time, elems)
}).on('cycle', function(event) {
  console.log(String(event.target))
}).run()
