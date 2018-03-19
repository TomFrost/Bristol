/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

'use strict'

const DEFAULT_SEVERITY_KEY = 'severity'
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

const stringify = require('json-stringify-safe')
const logUtil = require('../Bristol').Bristol.logUtil
const moment = require('moment')
const os = require('os')

const sanitize = (str) => {
  if (str) str = str.replace(/\s*\n\s*/g, ' | ')
  return str
}

const getLogVal = (val) => {
  const str = logUtil.nonObjToString(val)
  let logVal = ''
  if (str) {
    logVal = sanitize(str)
  } else if (val instanceof Error) {
    logVal = `<Err: ${sanitize(val.message)}>`
  } else if (val instanceof Date) {
    logVal = moment(val).format(DEFAULT_DATE_FORMAT)
  } else {
    logVal = sanitize(stringify(val))
  }
  if (logVal.indexOf(' ') >= 0) {
    logVal = '"' + logVal.replace('"', '\\"') + '"'
  }
  return logVal
}

/**
 * The Syslog format implements the syslog standard as defined in RFC 5424.
 * Note that it is STRONGLY suggested to set the severity levels to the
 * eight defined in section 6.2.1 of the Syslog RFC, linked below, when using
 * this formatter.  For convenience, these are:
 *
 * ['panic', 'alert', 'crit', 'error', 'warn', 'notice', 'info', 'debug']
 *
 * "panic" is optionally "emerg", and "error" is optionally "err".  The
 * resulting log message will be similar to:
 *
 * Apr 8 07:56:24 hostname node[2032]: Uncaught exception. severity=panic
 *   file=/path/to/file.js line=28 status="shutting down"
 *
 * @param {{[severityKey]}} options syslog accepts the following options:
 *   - {string} severityKey: The name of the key used for the severity
 * @param {string} severity The log severity
 * @param {Date} date The log date
 * @param {Array} elems An array of elements to be logged
 * @returns {string} The message to be logged
 # @see http://tools.ietf.org/html/rfc5424
 */
module.exports = (options, severity, date, elems) => {
  const sevKey = options.severityKey || DEFAULT_SEVERITY_KEY
  const obj = {}
  const dateStr = moment(date).format('MMM D HH:mm:ss')
  let line = `${dateStr} ${os.hostname()} ${process.title} [${process.pid}]:`
  let msg = ''
  obj[sevKey] = severity
  elems.forEach((elem) => {
    let str = logUtil.nonObjToString(elem)
    if (str !== null) {
      msg += ' ' + sanitize(str)
    } else if (elem instanceof Error) {
      msg += ` <Err: ${sanitize(elem.message)}>`
      logUtil.safeMerge(obj, {
        stackTrace: sanitize(elem.stack)
      })
    } else if (elem instanceof Date) {
      msg += ' ' + moment(elem).format(DEFAULT_DATE_FORMAT)
    } else if (typeof elem === 'object') {
      logUtil.safeMerge(obj, elem)
    }
  })
  // Construct message
  line += msg
  logUtil.forEachObj(obj, (key, val) => {
    line += ' ' + key + '=' + getLogVal(val)
  })
  return line
}
