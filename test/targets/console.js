/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

var should = require('should'),
	consoleTarget = require('../../lib/targets/console');

var consoleBuffer = '',
	oldConsole;

function clog(msg) {
	consoleBuffer = msg;
}

describe("Console Target", function() {
	after(function() {
		console.log = oldConsole;
	});
	it("should print the supplied message", function() {
		oldConsole = console.log;
		console.log = clog;
		consoleTarget({}, 'debug', new Date(), 'foo');
		consoleBuffer.should.eql('foo');
		console.log = oldConsole;
	});
});
