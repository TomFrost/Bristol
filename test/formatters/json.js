/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

var should = require('should'),
	json = require('../../lib/formatters/json');

describe('JSON Formatter', function() {
	it("should return valid JSON with severity property", function() {
		var res = json({}, 'debug', new Date(), ['hello']);
		res = JSON.parse(res);
		should.exist(res);
		res.should.have.property('message').and.eql('hello');
	});
	it("should supply a valid date", function() {
		var res = json({}, 'debug', new Date(), ['hello']);
		res = JSON.parse(res);
		should.exist(res);
		res.should.have.property('date').and
			.match(/\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d/);
	});
	it("should not overwrite duplicate keys", function() {
		var res = json({}, 'debug', new Date(), [
			'hello',
			{foo: 'bar'},
			{foo: 'car'}
		]);
		res = JSON.parse(res);
		should.exist(res);
		res.should.have.property('foo').and.eql('bar');
		res.should.have.property('foo0').and.eql('car');
	});
	it("should include a stack trace for errors", function() {
		var res = json({}, 'debug', new Date(), [
			'hello',
			new Error("This is a test")
		]);
		res = JSON.parse(res);
		should.exist(res);
		res.should.have.property('stackTrace');
	});
	it("should omit the messages object when there aren't any", function() {
		var res = json({}, 'debug', new Date(), [{foo:'bar'}]);
		res = JSON.parse(res);
		should.exist(res);
		res.should.not.have.property('messages');
	});
	it("should allow meta keys to be customized", function() {
		var opts = {
			messageKey: 'desc',
			dateKey: 'when',
			severityKey: 'badness'
		};
		var res = json(opts, 'debug', new Date(), ['omg']);
		res = JSON.parse(res);
		should.exist(res);
		res.should.have.property('desc').and.eql('omg');
		res.should.have.property('when');
		res.should.have.property('badness').and.eql('debug');
		res.should.not.have.property('message');
		res.should.not.have.property('date');
		res.should.not.have.property('severity');
	});
	it("should allow date format to be customized", function() {
		var opts = {
			dateFormat: 'YY-MM-DD'
		};
		var res = json(opts, 'debug', new Date(), ['omg']);
		res = JSON.parse(res);
		should.exist(res);
		res.should.have.property('date').and.match(/\d\d-\d\d-\d\d/);
	});
});
