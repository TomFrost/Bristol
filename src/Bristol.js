/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

'use strict'

const DEFAULT_SEVERITY_LEVELS = ['error', 'warn', 'info', 'debug', 'trace']
const DEFAULT_FORMATTER = require('./formatters/json')

const logUtil = require('./logUtil')
const events = require('events')

const originalPrepareStackTrace = Error.prepareStackTrace
const arrayPrepareStackTrace = (err, stack) => { return stack }

/**
 * The Bristol class defines a logger capable of simultaneous logging to
 * different destinations called "targets", using a specified format for each,
 * and parsing application-specific object types into meaningful attributes to
 * be logged.
 *
 * New instances of Bristol can be created with the traditional "new Bristol()"
 * style, however the object returned by require()ing this library is also
 * an instance of Bristol, for the convenience of being able to require it,
 * configure it, and have an immediately ready-to-use logger when requiring it
 * in any other file.
 */
class Bristol extends events.EventEmitter {
  constructor() {
    super()
    this._severities = {}
    this._targets = []
    this._transforms = []
    this._globals = {}
    this.setSeverities(DEFAULT_SEVERITY_LEVELS)
  }

  /**
   * Adds a logging target to Bristol.  The options supplied apply only to the
   * target module itself.  A formatter can be set, and restrictions can be
   * placed on the messages that this target receives by chaining this call with
   * a series of calls on the returned configuration object.
   *
   * If no configuration options are set, the default formatter is 'json' and
   * the target will receive all log messages.
   * @param {string|function} target The name of a built-in target, or a
   *   function with the signature (options.<Object>, severity.<string>,
   *   date.<Date>, message.<String>). Note that the target is not responsible
   *   for doing anything with the severity and date, as those should be
   *   handled by the formatter. They are provided in the event that the
   *   target may change its behavior based on these values.
   * @param {{}} [options] An optional set of arguments specific to the target
   *   being added
   * @returns {{
   *   withFormatter,
   *   excluding,
   *   onlyIncluding,
   *   withLowestSeverity,
   *   withHighestSeverity
   * }} A config chain object
   */
  addTarget(target, options) {
    if (typeof target === 'string') {
      target = require('./targets/' + target)
    }
    const targetObj = {
      log: target.bind(target, options || {}),
      formatter: DEFAULT_FORMATTER.bind(this, [{}]),
      blacklist: {},
      whitelist: {},
      leastVerbose: 0,
      mostVerbose: Infinity
    }
    this._targets.push(targetObj)
    return this._getTargetConfigChain(targetObj)
  }

  /**
   * Adds a transform function to the Bristol instance.  The transform functions
   * are called for every individual element to be logged, so Bristol can be made
   * aware of any application-specific data types and log out only appropriate
   * pieces of information when they're passed as an element.  This mechanism can
   * also be used to customize/silence the automatically provided metadata, such
   * as the origin file/line.  Transform functions take an element to be logged
   * as their only argument, and return the transformed version of that element.
   *
   * If a given element should not be transformed, simply return null.  Returning
   * anything other than null will halt any more transforms being run on top
   * of that element.  Transforms are executed in the order in which they are
   * added.
   * @param {function} transform A transform function, accepting an element
   *   that was passed to the logger and returning what should be logged.
   */
  addTransform(transform) {
    this._transforms.push(transform)
  }

  /**
   * Removes a previously-set global key/value pair.  Log messages pushed after
   * this is called will no longer include the removed pair.
   * @param {string} key The key of the global value to be deleted
   */
  deleteGlobal(key) {
    delete this._globals[key]
  }

  /**
   * Pushes the provided elements to each added target, under the given severity.
   * Only targets that have not been restricted against this severity or type
   * of element will be triggered.  The given elements can be of any type, as
   * long as there is a transform to handle it or the target's formatter can
   * sufficiently serialize it.
   *
   * This function emits two events:
   *   - log : fired for every call to the logger, immediately after the log
   *     elements are pushed to the targets.  The supplied argument will have
   *     the following properties:
   *       - {string} severity: The severity under which the elements were
   *         logged
   *       - {Date} date: A javascript Date object with the date under which
   *         the messages were logged
   *       - {Array} elements: An array of elements that were logged.  These
   *         elements could be of any type
   *   - log:SEVERITY : fired for every call to the logger, with 'SEVERITY'
   *     replaced by the actual severity used for the log message.  Argument
   *     is the same as for the 'log' event.
   * @param {string} severity A string defining the severity of the log message.
   *      This string should be one of the set passed to {@link #setSeverities},
   *      or one from the default set of ['error', 'warn', 'info', 'debug',
   *      'trace'] if that function was not called.
   * @param {...*} elements One or more elements of any type to be logged
   */
  log(severity, elements) { // eslint-disable-line no-unused-vars
    if (!this._severities.hasOwnProperty(severity)) {
      throw new Error(`Severity ${severity} does not exist.`)
    }
    const args = Array.prototype.slice.call(arguments)
    const logTime = new Date()
    const objArgs = {}
    const logElems = []
    // Remove the severity arg and put metadata first, all in one fell swoop
    args[0] = logUtil.safeMerge(this._getOrigin(), this._getGlobals())
    for (let i = 0; i < args.length; i++) {
      const arg = this._transform(args[i])
      if (typeof arg === 'object' && !(arg instanceof Error)) {
        logUtil.safeMerge(objArgs, arg)
      } else {
        logElems.push(arg)
      }
    }
    logElems.push(objArgs)
    this._targets.forEach((target) => {
      this._logToTarget(target, severity, logTime, logElems)
    })
    const eventObj = {
      severity: severity,
      date: logTime,
      elements: logElems
    }
    this.emit('log', eventObj)
    this.emit('log:' + severity, eventObj)
  }

  /**
   * Sets a global key/value pair that will be logged with every message sent
   * by this Bristol instance.  If val is provided as a function, the function
   * will be executed for every log message, and the logged value for that key
   * will be its result.
   * @param {string} key The key number under which to log the value
   * @param {*} val The value to be logged
   */
  setGlobal(key, val) {
    this._globals[key] = val
  }

  /**
   * Replaces the currently set severity levels with a new set.  This function
   * will make a new set of severity-named functions available on the Bristol
   * instances, and remove the old ones.  Function calls to a previously-set
   * severity level WILL fail, if that level does not also appear in the new set.
   *
   * Severity levels should be supplied in an array of strings, in the order of
   * most-severe to least-severe.
   * @param {Array.<string>} levels The severity levels to use in this Bristol
   *      instance
   */
  setSeverities(levels) {
    const oldLevels = this._severities
    const self = this
    // Delete the existing error level functions
    logUtil.forEachObj(this._severities, (key) => {
      delete this[key]
    })
    // Create the new ones
    levels.forEach((level, idx) => {
      this._severities[level] = idx
      if (!this[level]) {
        this[level] = function() {
          const args = Array.prototype.slice.call(arguments)
          args.unshift(level)
          self.log.apply(self, args)
        }
      } else {
        this.setSeverities(oldLevels)
        throw new Error(`Error level ${level} is already a Bristol function and cannot be used.`)
      }
    })
  }

  /**
   * Retrieves the set global key/value pairs, executing any values that were
   * supplied as functions.
   * @returns {{}} An object containing global key/value pairs, with any
   *   function values replaced with their result.
   * @private
   */
  _getGlobals() {
    const globals = {}
    logUtil.forEachObj(this._globals, (key, val) => {
      if (typeof val === 'function') globals[key] = val()
      else globals[key] = val
    })
    return globals
  }

  /**
   * Finds the origin of the Bristol log call, and supplies the file path and
   * line number.
   * This function uses JavaScriptStackTraceApi to be as fast as possible:
   * https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi
   * @returns {null|{file, line}} An object containing the file path and line
   *   number of the originating Bristol call, or null if this information
   *   cannot be found.
   * @private
   */
  _getOrigin() {
    Error.prepareStackTrace = arrayPrepareStackTrace
    const stack = (new Error()).stack
    let origin = null
    for (let i = 1; i < stack.length; i++) {
      const file = stack[i].getFileName()
      if (file !== __filename) {
        origin = {
          file,
          line: stack[i].getLineNumber().toString()
        }
        break
      }
    }
    Error.prepareStackTrace = originalPrepareStackTrace
    return origin
  }

  /**
   * Gets an object containing chainable configuration functions that allow
   * options to be specified on a given target.
   * @param {{
   *   log,
   *   formatter,
   *   blacklist,
   *   whitelist,
   *   leastVerbose,
   *   mostVerbose
   * }} target The target to be modified
   * @returns {{
   *   withFormatter,
   *   excluding,
   *   onlyIncluding,
   *   withLowestSeverity,
   *   withHighestSeverity
   * }} A config chain object
   * @private
   */
  _getTargetConfigChain(target) {
    const chain = {}
    chain.withFormatter = (formatter, options) => {
      if (typeof formatter === 'string') {
        formatter = require('./formatters/' + formatter)
      }
      target.formatter = formatter.bind(formatter, options || {})
      return chain
    }
    chain.excluding = (blacklist) => {
      target.blacklist = blacklist
      return chain
    }
    chain.onlyIncluding = (whitelist) => {
      target.whitelist = whitelist
      return chain
    }
    chain.withLowestSeverity = (severity) => {
      if (!this._severities.hasOwnProperty(severity)) {
        throw new Error(`Severity ${severity} does not exist.`)
      }
      target.mostVerbose = this._severities[severity]
      return chain
    }
    chain.withHighestSeverity = (severity) => {
      if (!this._severities.hasOwnProperty(severity)) {
        throw new Error(`Severity ${severity} does not exist.`)
      }
      target.leastVerbose = this._severities[severity]
      return chain
    }
    return chain
  }

  /**
   * Pushes a set of elements to a given logging target, given that the
   * restrictions set on the given target do not block it.
   *
   * Note that, for efficiency, this function assumes that the elements have
   * been rearranged so that all standard JS objects have been merged into a
   * single object, and that object is the last element in the array of elements.
   * The side-effect of this efficiency-boost is that the blacklist/whitelist
   * tests will be run on that resulting object; so if there are any duplicate
   * keys that were renamed during the merge, the filters will not be applied
   * to those keys.  Likelihood of this being a problem is low, but this may be
   * revisited in a future version of Bristol.
   * @param {{
   *   log,
   *   formatter,
   *   blacklist,
   *   whitelist,
   *   leastVerbose,
   *   mostVerbose
   * }} target A target object to which the log elements should be pushed
   * @param {string} severity The severity level under which to log the elements
   * @param {Date} date A Date object defining the time to be used for the log
   *   message
   * @param {Array} elems An array of elements to be logged, of any type.
   * @private
   */
  _logToTarget(target, severity, date, elems) {
    const verbosity = this._severities[severity]
    const testObj = elems[elems.length - 1]
    if (verbosity >= target.leastVerbose &&
        verbosity <= target.mostVerbose &&
        !logUtil.matchesOneKey(testObj, target.blacklist) &&
        logUtil.matchesAllKeys(testObj, target.whitelist)) {
      const str = target.formatter(severity, date, elems)
      target.log(severity, date, str)
    }
  }

  /**
   * Applies all transforms to an element, stopping when a transform returns a
   * non-null value.
   * @param {*} elem Any element to be transformed
   * @returns {*} The transformed element, or the original element if no
   *   transform modified it.
   * @private
   */
  _transform(elem) {
    let result
    for (let i = 0; i < this._transforms.length; i++) {
      result = this._transforms[i](elem)
      if (result !== null) break
    }
    return result || elem
  }
}

module.exports = new Bristol()
module.exports.Bristol = Bristol
module.exports._logUtil = logUtil
