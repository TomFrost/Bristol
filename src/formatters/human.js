/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

'use strict'

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

const stringify = require('json-stringify-safe')
const logUtil = require('../Bristol').Bristol.logUtil
const moment = require('moment')

const sanitize = (str) => {
  if (str) str.replace(/\n\s*/g, '\n\t\t')
  return str
}

/**
 * The human format is excellent for human-readable logging during development,
 * but is often a poor choice for long-term or aggregated logging due to taking
 * up more than one line per message, with significant whitespace for
 * formatting.  A human-formatted message looks like this:
 *
 * [2014-04-07 22:14:48] INFO: User connected (/path/to/myFile.js:245)
 *   userId: 575
 *   userName: t3h PeNgU1N oF d00m
 *   accountType: paid
 *   connectionsToday: 3
 *
 * @param {{[dateFormat]}} options json
 *   accepts the following options:
 *     - {string} dateFormat: The format to use for the date. Should
 *       follow the date formatting spec for Moment, found at:
 *       http://momentjs.com/docs/#/parsing/string-format/.
 *       Default: 'YYYY-MM-DD HH:mm:ss'
 * @param {string} severity Log message severity
 * @param {Date} date Log message date
 * @param {Array} elems An array of elements to be logged
 * @returns {string} The message to be logged
 */
module.exports = (options, severity, date, elems) => {
  const obj = {}
  const dateFormat = options.dateFormat || DEFAULT_DATE_FORMAT
  let title = ''
  let msg = ''

  date = moment(date).format(dateFormat)
  elems.forEach((elem) => {
    let str = logUtil.nonObjToString(elem)
    if (str !== null) {
      title += ' ' + str
    } else if (elem instanceof Error) {
      title += ' <Err: ' + elem.message + '>'
      logUtil.safeMerge(obj, {
        stackTrace: sanitize(elem.stack)
      })
    } else if (elem instanceof Date) {
      title += ' ' + moment(elem).format(dateFormat)
    } else if (typeof elem === 'object') {
      logUtil.safeMerge(obj, elem)
    }
  })
  if (title) {
    title = title.substr(1)
  }
  msg = `[${date}] ${severity.toUpperCase()}: ${title}`
  if (obj.file && obj.line) {
    msg += ` (${obj.file}:${obj.line})`
    delete obj.file
    delete obj.line
  }
  logUtil.forEachObj(obj, (key, val) => {
    let strVal = ''
    try {
      strVal = val.toString()
      if (strVal === '[object Object]') {
        // Pretty-print objects with JSON
        strVal = ('\n' + stringify(val, null, '    ')).replace(/\n/g, '\n\t    ')
      }
    } catch (e) {
      // Swallow
    }
    msg += `\n\t${key}: ${strVal}`
  })
  return msg
}
