/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

'use strict'

const DEFAULT_MESSAGE_KEY = 'message'
const DEFAULT_SEVERITY_KEY = 'severity'
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

const stringify = require('json-stringify-safe')
const logUtil = require('../Bristol').Bristol.logUtil
const moment = require('moment')

const sanitize = (str) => {
  if (str) {
    str = str.replace(/"/g, "'")
    str = str.replace(/\s*\n\s*/g, ' | ')
  }
  return str
}

const getLoggable = (val) => {
  const str = logUtil.nonObjToString(val)
  if (str) return sanitize(str)
  if (val instanceof Error) return '<Err: ' + sanitize(val.message) + '>'
  if (val instanceof Date) return moment(val).format(DEFAULT_DATE_FORMAT)
  return sanitize(stringify(val))
}

/**
 * The Common Info Model format defines a log message as a series of key/value
 * pairs following a date, in the configuration:
 *
 * 2014-04-07 23:06:32 severity="info" event="user:login" username="todd"
 *   connectionsToday=5
 *
 * True CIM format cannot be enforced by this formatter, however, as it also
 * includes a consistent naming scheme that must be implemented at the
 * application level.
 * @param {{[messageKey], [severityKey]}} options json
 *   accepts the following options:
 *     - {string} messageKey: The name of the key used to collect
 *       non-object elements
 *     - {string} severityKey: The name of the key used for the severity
 * @param {string} severity The log severity
 * @param {Date} date The log date
 * @param {Array} elems An array of elements to be logged
 * @returns {string} The message to be logged
 */
module.exports = (options, severity, date, elems) => {
  const msgKey = options.messageKey || DEFAULT_MESSAGE_KEY
  const sevKey = options.severityKey || DEFAULT_SEVERITY_KEY
  const obj = {}
  let msg = moment(date).format(DEFAULT_DATE_FORMAT)
  obj[msgKey] = ''
  obj[sevKey] = severity
  elems.forEach((elem) => {
    const str = logUtil.nonObjToString(elem)
    if (str !== null) {
      obj[msgKey] += ' ' + sanitize(str)
    } else if (elem instanceof Error) {
      obj[msgKey] += ' <Err: ' + sanitize(elem.message) + '>'
      logUtil.safeMerge(obj, {
        stackTrace: sanitize(elem.stack)
      })
    } else if (elem instanceof Date) {
      obj[msgKey] += ' ' + moment(elem).format(DEFAULT_DATE_FORMAT)
    } else if (typeof elem === 'object') {
      logUtil.safeMerge(obj, elem)
    }
  })
  if (obj[msgKey]) {
    obj[msgKey] = obj[msgKey].substr(1)
  } else {
    delete obj[msgKey]
  }
  // Construct message
  logUtil.forEachObj(obj, (key, val) => {
    msg += ' ' + key + '="' + getLoggable(val) + '"'
  })
  return msg
}
