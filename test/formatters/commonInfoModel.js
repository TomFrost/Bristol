/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

var should = require('should'),
	commonInfoModel = require('../../lib/formatters/commonInfoModel');

var msg;

describe("CommonInfoModel Formatter", function() {
	before(function() {
		msg = commonInfoModel({}, 'debug', new Date(), [
			'hello',
			{foo: 'bar', hello: 'world'},
			new Error('Test error'),
			{obj: { str: "hello" }}
		]);
		should.exist(msg);
	});
	it("should start with the date", function() {
		msg.should.be.of.type('string').and
			.match(/^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d/);
	});
	it("should not contain any newlines", function() {
		msg.should.not.match(/\n/);
	});
	it("should stringify object literals", function() {
		msg.should.not.match(/\[object Object\]/);
		msg.should.match(/'str':'hello'/);
	});
});
