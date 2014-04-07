/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

var log = require('..'),
	should = require('should');

var b;

describe('Bristol', function() {
	beforeEach(function() {
		b = new log.Bristol();
	});
	describe('setSeverities', function() {
		it("should create functions for default severities", function() {
			['error', 'warn', 'info', 'debug', 'trace'].forEach(function(s) {
				var y = b.should.have.property(s).and.is.a.function;
			});
		});
		it("should replace default functions with new ones", function() {
			var sevs = ['omg', 'uhoh', 'k', 'wtf', 'yo'];
			b.setSeverities(sevs);
			sevs.forEach(function(s) {
				var y = b.should.have.property(s).and.is.a.function;
			});
			['error', 'warn', 'info', 'debug', 'trace'].forEach(function (s) {
				b.should.not.have.property(s);
			});
		});
	});
	describe('origin', function() {
		it("should get the origin of this call", function() {
			var origin = log._getOrigin();
			origin.should.have.property('file').of.type('string')
				.and.eql(__filename);
			origin.should.have.property('line').of.type('string');
		});
	});
	describe('targets', function() {
		it("should return a config chain with all properties", function() {
			var conf = b.addTarget(function(opts, sev, date, msg) {});
			conf.should.have.property('withFormatter').of.type('function');
			conf.should.have.property('excluding').of.type('function');
			conf.should.have.property('onlyIncluding').of.type('function');
			conf.should.have.property('withLowestSeverity').of
				.type('function');
			conf.should.have.property('withHighestSeverity').of
				.type('function');
		});
		it("should push log messages to the target", function() {
			var res = {};
			b.addTarget(function(opts, sev, date, msg) {
				res.opts = opts;
				res.sev = sev;
				res.date = date;
				res.msg = msg;
			});
			b.error('Something died!', {omg:'no'});
			res.should.have.property('opts');
			res.should.have.property('sev').and.eql('error');
			res.should.have.property('date').and.be.instanceof(Date);
			res.should.have.property('msg');
			var json = JSON.parse(res.msg);
			should.exist(json);
			json.should.have.property('file').and.eql(__filename);
		});
		it("should observe severity boundaries on target", function() {
			var res = {};
			b.addTarget(function(opts, sev, date, msg) {
				res.msg = msg;
			}).withHighestSeverity('warn').withLowestSeverity('debug');
			b.error('oh no');
			res.should.not.have.property('msg');
			b.trace('omg');
			res.should.not.have.property('msg');
		});
		it("should observe whitelist", function() {
			var res = {};
			b.addTarget(function(opts, sev, date, msg) {
				res.msg = msg;
			}).onlyIncluding({
				foo: ['bar', 'car'],
				hello: 'world'
			});
			b.info('hello!', {
				foo: 'car',
				hello: 'world'
			});
			b.trace('goodbye!', {
				foo: 'bar',
				hello: 'my ragtime gal'
			});
			res.should.have.property('msg').and.match(/world/);
		});
		it("should observe blacklist", function() {
			var res = {};
			b.addTarget(function(opts, sev, date, msg) {
				res.msg = msg;
			}).excluding({
				foo: ['bar', 'car'],
				hello: 'world'
			});
			b.warn({
				foo: 'star',
				hello: 'nice to meet you'
			});
			b.debug({
				foo: 'car',
				hello: 'nice to meet you'
			});
			res.should.have.property('msg').and.match(/star/);
		});
		it("should support a custom formatter", function() {
			var res = {};
			b.addTarget(function(opts, sev, date, msg) {
				res.msg = msg;
			}).withFormatter(function(opts, sev, date, elems) {
				res.opts = opts;
				res.sev = sev;
				res.date = date;
				res.elems = elems;
				return 'foo';
			}, {cow: 'moo'});
			b.trace('hello');
			res.should.have.property('msg').and.eql('foo');
			res.should.have.property('opts').and.containEql({cow: 'moo'});
			res.should.have.property('sev').and.eql('trace');
			res.should.have.property('date').and.be.instanceof(Date);
			res.should.have.property('elems').and.be.an.Array;
			res.elems.length.should.be.above(1);
		});
		it("should log to multiple targets", function() {
			var one = 0, two = 0;
			b.addTarget(function() { one++; });
			b.addTarget(function() { two++; });
			b.log('trace', 'hello');
			one.should.eql(1);
			two.should.eql(1);
		});
	});
	describe('transforms', function() {
		it("should apply a transform to an element", function() {
			var res;
			b.addTarget(function(opts, sev, date, msg) {
				res = msg;
			});
			b.addTransform(function(elem) {
				if (elem.foo) {
					elem.foo = 'star';
					return elem;
				}
				return null;
			});
			b.error({
				cow: 'moo',
				foo: 'bar'
			});
			res = JSON.parse(res);
			should.exist(res);
			res.should.containEql({foo: 'star'});
			res.should.containEql({file: __filename});
		});
		it("should stop running transforms when successful", function() {
			var res;
			b.addTarget(function(opts, sev, date, msg) {
				res = msg;
			});
			b.addTransform(function(elem) {
				if (elem.foo) {
					elem.foo = 'star';
					return elem;
				}
				return null;
			});
			b.addTransform(function(elem) {
				if (elem.cow) {
					elem.cow = 'neigh';
					return elem;
				}
				return null;
			});
			b.error({
				cow: 'moo',
				foo: 'bar'
			});
			res = JSON.parse(res);
			should.exist(res);
			res.should.containEql({foo: 'star'});
			res.should.containEql({cow: 'moo'});
		});
	});
	describe('globals', function() {
		it("should allow global variables to be added", function() {
			var res;
			b.addTarget(function(opts, sev, date, msg) {
				res = msg;
			});
			b.setGlobal('foo', 'bar');
			b.debug('test');
			should.exist(res);
			res.should.match(/foo/).and.match(/bar/);
		});
		it("should allow global variables to be removed", function() {
			var res;
			b.addTarget(function(opts, sev, date, msg) {
				res = msg;
			});
			b.setGlobal('foo', 'bar');
			b.deleteGlobal('foo');
			b.debug('test');
			should.exist(res);
			res.should.not.match(/foo/);
		});
		it("should execute value as function when log is called", function() {
			var res;
			b.addTarget(function(opts, sev, date, msg) {
				res = msg;
			});
			b.setGlobal('foo', function() { return 'bar'; });
			b.trace('test');
			should.exist(res);
			res.should.match(/bar/);
		});
	});
	describe('events', function() {
		it("should fire 'log' with each message", function(done) {
			b.on('log', function(arg) {
				should.exist(arg);
				arg.should.have.property('severity').and.eql('error');
				done();
			});
			b.error('test');
		});
		it("should fire 'log:severity' with each message", function(done) {
			b.on('log:error', function(arg) {
				should.exist(arg);
				arg.should.have.property('severity').and.eql('error');
				done();
			});
			b.error('test');
		});
	});
});
