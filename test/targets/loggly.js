/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

var should = require('should'),
	logglyTarget = require('../../lib/targets/loggly');



describe("Loggly Target", function() {
	(function(){
		logglyTarget({token: 'Your-Token', username: 'Your-Username', password: 'Your-Password', subdomain: 'Your-subdomain'},'debug', new Date(), 'foo')
	}).should.not.throw();

	(function(){
		logglyTarget({},'debug', new Date(), 'foo')
	}).should.throw();
});
