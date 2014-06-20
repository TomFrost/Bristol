/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

var should = require('should'),
	file = require('../../lib/targets/file'),
	tmp = require('tmp'),
	fs = require('fs');

var tmpFile;

describe("File Target", function() {
	before(function(done) {
		tmp.setGracefulCleanup();
		tmp.tmpName(function(err, path) {
			if (err) throw err;
			tmpFile = path;
			done();
		});
	});
	it("should write the supplied message to a file", function(done) {
		file({file: tmpFile}, 'debug', new Date(), 'foo');
		setTimeout(function() {
			fs.readFile(tmpFile, {encoding:'utf8'}, function(err, data) {
				should.not.exist(err);
				should.exist(data);
				data.should.eql("foo\n");
				done();
			});
		}, 500);
	});
});
