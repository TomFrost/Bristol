/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

'use strict'

const loggly = require('loggly')

const logglyClients = {}

const getLogglyClient = (token, subdomain, username, password, tags) => {
  const cid = token + subdomain
  if (!logglyClients[cid]) {
    const opts = {
      token: token,
      subdomain: subdomain,
      auth: {
        username: username,
        password: password
      }
    }
    if (tags) {
      if (!Array.isArray(tags)) {
        tags = [tags]
      }
      opts.tags = tags
    }
    logglyClients[cid] = loggly.createClient(opts)
  }
  return logglyClients[cid]
}

/**
 * Pushes a log message to loggly
 * @param {Object} options  Map of options to customize Loggly
 * @param {string} options.token Your loggly token
 * @param {string} options.subdomain Loggly subdomain
 * @param {string} options.username Loggly username
 * @param {string} options.password Loggly password
 * @param {Array|string} [options.tags] Global Loggly tags
 * @param {string} severity The severity of the log message
 * @param {Date} date The date of the log message
 * @param {string} message The message to be pushed to loggly
 */
const log = (options, severity, date, message) => {
  const client = getLogglyClient(options.token, options.subdomain, options.username, options.password, options.tags)
  const tags = options.tags || null
  client.log(message, tags, (err) => {
    if (err) {
      console.error(`Error publishing log message to Loggly: ${err} - Message was: ${message}`)
    }
  })
}

module.exports = log
