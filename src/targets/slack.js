/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

'use strict'

const request = require('request-promise')

/**
 * The Slack target posts to a Slack channel via POST to a webhook.
 * @param {Object} options Map of options for Slack
 * @param {string} options.webhook Slack webhook URL
 * @param {boolean} [options.format=false] Attempt to format the message
 * @param {boolean} [options.wrapBlock] Wrap log block in code/pre
 * @param {string} [options.icon_emoji] Slack emoji code for message icon, ex: :boom:
 * @param {string} [options.username] Username to display
 * @param {string} [options.channel] The channel to send to in Slack
 * @param {string} severity Unused
 * @param {Date} date Unused
 * @param {string} message The message to be sent to Slack
 */
module.exports = (options, severity, date, message) => {
  let text
  const nlIndex = message.indexOf('\n')
  const formatBlock = (block) => options.wrapBlock ? `\`\`\`${block}\`\`\`` : block
  // Perform formatting
  if (nlIndex > 0 && options.format) {
    // Message contains \n assume human formatter, split and format
    const str = message.substr(0, nlIndex)
    const block = message.slice(nlIndex + 1)
    text = `*${str}*\n${formatBlock(block)}`
  } else {
    // Send message as pre block
    text = formatBlock(message)
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
