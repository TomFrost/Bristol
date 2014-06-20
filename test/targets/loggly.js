/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

var should = require('should'),
	logglyTarget = require('../../lib/targets/loggly');

describe("Loggly Target", function() {
	it('should successfully call the target', function() {
		(function(){
			logglyTarget({
				token: 'Your-Token',
				username: 'Your-Username',
				password: 'Your-Password',
				subdomain: 'Your-Subdomain'
			}, 'debug', new Date(), 'foo');
		}).should.not.throw();
	});
	it('should fail with missing options', function() {
		(function(){
			logglyTarget({},'debug', new Date(), 'foo')
		}).should.throw();
	});
});
