/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

var should = require('should'),
	syslog = require('../../lib/formatters/syslog');

var msg;

describe("CommonInfoModel Formatter", function() {
	before(function() {
		msg = syslog({}, 'debug', new Date(), [
			'hello',
			{foo: 'bar', hello: 'world'},
			new Error('Test error')
		]);
		should.exist(msg);
	})
	it("should start with the date", function() {
		msg.should.be.of.type('string').and
			.match(/^\w\w\w \d\d? \d\d:\d\d:\d\d/);
	});
	it("should not contain any newlines", function() {
		msg.should.not.match(/\n/);
	});
});
