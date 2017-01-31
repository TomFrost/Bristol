/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

'use strict'

const request = require('request-promise')

/**
 * The console target simply console.log()s any message it is passed.
 * @param {Object} options Map of options for Slack
 * @param {string} options.webhook Slack webhook URL
 * @param {string} options.icon_emoji Slack emoji code for message icon, ex: :boom:
 * @param {string} options.username Username to display
 * @pamam {string} options.channel Specify channel to post to
 * @param {string} severity Unused
 * @param {Date} date Unused
 * @param {string} message The message to be sent to Slack
 */
module.exports = (options, severity, date, message) => {
  let text
  if (message.indexOf('\n') >= 0) {
    // Message contains \n assume human formatter, split and format
    const str = message.substr(0, message.indexOf('\n'))
    const block = message.slice(message.indexOf('\n') + 1)
    text = `*${str}*\n\`\`\`${block}\`\`\``
  } else {
    // Send message as pre block
    text = `\`\`\`${message}\`\`\``
  }
  // Set options for request
  const opts = {
    uri: options.webhook,
    json: true,
    body: {
      icon_emoji: options.icon_emoji || undefined,
      username: options.username || undefined,
      channel: options.channel || undefined,
      text
    }
  }
  request.post(opts).catch((err) => {
    /* istanbul ignore next */
    console.error(`Error publishing log message to slack: ${err} - Message was: ${message}`)
  })
}


// log.addTarget('slack', { webhook: 'https://whatever' })
//   .withFormatter('human')
//   .withLowestSeverity('error')
