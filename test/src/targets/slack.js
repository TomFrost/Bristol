/*
 * Bristol
 * Copyright 2014-2016 Tom Shawver
 */

/* global describe,it,beforeEach,afterEach,before,after */
'use strict'

const slackTarget = require('src/targets/slack')
const request = require('request-promise')
const chai = require('chai')
const sinon = require('sinon')
chai.use(require('sinon-chai'))

describe('Slack Target', () => {
  let requestStub
  beforeEach(() => {
    requestStub = sinon.stub(request, 'post', () => Promise.resolve())
  })
  afterEach(() => {
    if (requestStub.restore) requestStub.restore()
    if (console.error.restore) console.error.restore()
  })
  it('sends basic message to slack webhook', () => {
    slackTarget({ webhook: 'foo' }, 'bar', new Date(), 'test')
    requestStub.should.be.calledWith(sinon.match({
      uri: 'foo',
      json: true,
      body: {
        icon_emoji: undefined,
        username: undefined,
        channel: undefined,
        text: 'test'
      }
    }))
  })
  it('sends message with custom opts to slack webhook', () => {
    slackTarget({
      webhook: 'foo',
      icon_emoji: ':boom:',
      username: 'bristol',
      channel: 'test-channel'
    }, 'bar', new Date(), 'test')
    requestStub.should.be.calledWith(sinon.match({
      uri: 'foo',
      json: true,
      body: {
        icon_emoji: ':boom:',
        username: 'bristol',
        channel: 'test-channel',
        text: 'test'
      }
    }))
  })
  it('sends formatted message (when human formatter used) to slack webhook', () => {
    slackTarget({ webhook: 'foo', format: true, wrapBlock: true }, 'bar', new Date(), 'test\ndata')
    requestStub.should.be.calledWith(sinon.match({
      uri: 'foo',
      json: true,
      body: {
        icon_emoji: undefined,
        username: undefined,
        channel: undefined,
        text: '*test*\n```data```'
      }
    }))
  })
})
