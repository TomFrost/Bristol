/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

'use strict'

const fs = require('fs')

/**
 * A collection of created WriteStreams
 * @type {Object.<string,WriteStream>}
 */
const streams = {}

/**
 * Gets a Node.js WriteStream object for a given file, creating it if it does
 * not exist.  The WriteStream will be created in 'append' mode, preserving the
 * file contents.
 * @param {string} path The path to the file for which a WriteStream is needed.
 * @return {WriteStream} An active WriteStream object for the given file.
 */
const getStream = (path) => {
  if (!streams[path] || !streams[path].writable) {
    streams[path] = fs.createWriteStream(path, { flags: 'a' })
    streams[path].on('error', (err) => {
      console.error(`Error writing to ${path}: ${err.message}`)
    })
  }
  return streams[path]
}

/**
 * Logs a message to a file.
 * @param {{file}} options The File target requires the following options:
 *   - {string} file: The full path to the file to be created or opened
 * @param {string} severity Unused
 * @param {Date} date Unused
 * @param {string} message The message to be logged
 */
const log = (options, severity, date, message) => {
  const out = getStream(options.file)
  out.write(message + '\n')
}

module.exports = log
