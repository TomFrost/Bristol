/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

var should = require('should'),
	human = require('../../lib/formatters/human');

var msg;

describe('Human Formatter', function() {
	before(function() {
		msg = human({}, 'debug', new Date(), [
			'Hello!',
			{is_it: 'me', "you're": 'looking for'},
			{file: __filename, line: 82}
		]);
	});
	it("should output multiple lines", function() {
		msg.should.be.of.type('string').and.match(/\n/);
	});
	it("should output the date", function() {
		msg.should.match(/^\D*\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d\D/);
	});
	it("should output the severity, in uppercase", function() {
		msg.match(/DEBUG/);
	});
	it("should output loose strings in line 1", function() {
		msg.should.match(/^[^\n]+Hello!/);
	});
	it("should output file and line in line 1", function() {
		msg.should.match(/^[^\n]+human\.js:82/);
	})
});
