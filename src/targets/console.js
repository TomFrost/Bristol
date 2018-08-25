/*
 * Bristol
 * Copyright 2014-2018 Tom Shawver
 */

'use strict'

/**
 * The console target simply console.log()s any message it is passed.
 * @param {{}} options This target has no options
 * @param {string} severity Unused
 * @param {Date} date Unused
 * @param {string} message The message to be logged
 */
module.exports = (options, severity, date, message) => {
  console.log(message)
}
