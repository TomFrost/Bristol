/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

'use strict'

const DEFAULT_MESSAGE_KEY = 'message'
const DEFAULT_DATE_KEY = 'date'
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DEFAULT_SEVERITY_KEY = 'severity'

const stringify = require('json-stringify-safe')
const logUtil = require('../Bristol').Bristol.logUtil
const moment = require('moment')

const sanitize = (str) => {
  if (str) str.replace(/\s*[\n\r]+\s*/g, ' | ')
  return str
}

/**
 * The json formatter concatenates all non-object elements into a message
 * key, merges it with the other objects, and json-serializes it.  The date
 * and severity are also added to this object.
 * @param {{[messageKey], [dateKey], [dateFormat], [severityKey]}} options json
 *   accepts the following options:
 *     - {string} messageKey: The name of the key used to collect
 *       non-object elements
 *     - {string} dateKey: The name of the key used for the date
 *     - {string} severityKey: The name of the key used for the severity
 *     - {string} dateFormat: The format to use for the date. Should
 *       follow the date formatting spec for Moment, found at:
 *       http://momentjs.com/docs/#/parsing/string-format/.
 *       Default: 'YYYY-MM-DD HH:mm:ss'
 * @param {string} severity Unused
 * @param {Date} date Unused
 * @param {Array} elems An array of elements to be logged
 * @returns {string} The message to be logged
 */
module.exports = (options, severity, date, elems) => {
  const msgKey = options.messageKey || DEFAULT_MESSAGE_KEY
  const dateKey = options.dateKey || DEFAULT_DATE_KEY
  const dateFormat = options.dateFormat || DEFAULT_DATE_FORMAT
  const sevKey = options.severityKey || DEFAULT_SEVERITY_KEY
  const obj = {}
  obj[msgKey] = ''
  obj[dateKey] = moment(date).format(dateFormat)
  obj[sevKey] = severity
  elems.forEach((elem) => {
    let str = logUtil.nonObjToString(elem)
    if (str !== null) {
      obj[msgKey] += ' ' + str
    } else if (elem instanceof Error) {
      obj[msgKey] += ` <Err: ${elem.message}>`
      logUtil.safeMerge(obj, {
        stackTrace: sanitize(elem.stack)
      })
    } else if (elem instanceof Date) {
      obj[msgKey] += ' ' + moment(elem).format(dateFormat)
    } else if (typeof elem === 'object') {
      logUtil.safeMerge(obj, elem)
    }
  })
  if (obj[msgKey]) {
    obj[msgKey] = obj[msgKey].substr(1)
  } else {
    delete obj[msgKey]
  }
  return stringify(obj)
}
