/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

var logUtil = require('../lib/Util'),
	should = require('should');

describe("Util", function() {
	describe("matchesOneVal", function() {
		it("should not match when no equality matches", function() {
			var list = ['boo', 'poo', 'loo'];
			var res = logUtil.matchesOneValue('foo', list);
			res.should.eql(false);
		});
		it("should match when an equality matches", function() {
			var list = ['boo', 'poo', 'foo'];
			var res = logUtil.matchesOneValue('foo', list);
			res.should.eql(true);
		});
		it("should not match when no regex matches", function() {
			var list = [/boo/, /poo/, /loo/];
			var res = logUtil.matchesOneValue('foo', list);
			res.should.eql(false);
		});
		it("should match when a regex matches", function() {
			var list = [/boo/, /poo/, /foo/];
			var res = logUtil.matchesOneValue('foo', list);
			res.should.eql(true);
		});
		it("should not match when no function matches", function() {
			var list = [
				function(elem) { return elem == 'boo' },
				function(elem) { return elem == 'poo' }
			];
			var res = logUtil.matchesOneValue('foo', list);
			res.should.eql(false);
		});
		it("should match when a function matches", function() {
			var list = [
				function(elem) { return elem == 'boo' },
				function(elem) { return elem == 'foo' }
			];
			var res = logUtil.matchesOneValue('foo', list);
			res.should.eql(true);
		});
		it("should not match against a non-matching mixed list", function() {
			var list = ['boo', /poo/, function(e) { return e == 'loo'; }];
			var res = logUtil.matchesOneValue('foo', list);
			res.should.eql(false);
		});
		it("should match against a matching mixed list", function() {
			var list = ['boo', /poo/, function (e) { return e == 'foo'; }];
			var res = logUtil.matchesOneValue('foo', list);
			res.should.eql(true);
		});
		it("should not match against a single non-matching value", function() {
			var res = logUtil.matchesOneValue('foo', 'boo');
			res.should.eql(false);
		});
		it("should match against a single matching value", function() {
			var res = logUtil.matchesOneValue('foo', 'foo');
			res.should.eql(true);
		});
	});
	describe("matchesOneKey", function() {
		it("should pass an unmatched 1:1 blacklist", function() {
			var blacklist = {
				foo: 'bar',
				hello: 'world'
			};
			var haystack = {
				fishSticks: 'awesome',
				foo: 'car',
				hello: 'to my little friend'
			};
			var blacklisted = logUtil.matchesOneKey(haystack, blacklist);
			blacklisted.should.eql(false);
		});
		it("should fail a matched 1:1 blacklist", function() {
			var blacklist = {
				foo: 'bar',
				hello: 'world'
			};
			var haystack = {
				fishSticks: 'still awesome',
				foo: 'car',
				hello: 'world'
			};
			var blacklisted = logUtil.matchesOneKey(haystack, blacklist);
			blacklisted.should.eql(true);
		});
		it("should pass an unmatched 1:many blacklist", function() {
			var blacklist = {
				foo: ['bar', 'car', 'scar', 'far'],
				hello: ['my lady', 'my honey', 'my ragtime gal']
			};
			var haystack = {
				fishSticks: 'increasingly awesome',
				foo: 'star',
				hello: 'world'
			};
			var blacklisted = logUtil.matchesOneKey(haystack, blacklist);
			blacklisted.should.eql(false);
		});
		it("should fail a matched 1:many blacklist", function() {
			var blacklist = {
				foo: ['bar', 'car', 'scar', 'far'],
				hello: ['my lady', 'my honey', 'my ragtime gal']
			};
			var haystack = {
				fishSticks: 'increasingly awesomer',
				foo: 'car',
				hello: 'world'
			};
			var blacklisted = logUtil.matchesOneKey(haystack, blacklist);
			blacklisted.should.eql(true);
		});
		it("should pass an unmatched blacklist with regexes", function() {
			var blacklist = {
				foo: /^.ar$/i,
				hello: ['is it me you\'re looking for?', /baby/g]
			};
			var haystack = {
				fishSticks: 'awesome++',
				foo: 'char',
				hello: 'world'
			};
			var blacklisted = logUtil.matchesOneKey(haystack, blacklist);
			blacklisted.should.eql(false);
		});
		it("should fail a matched blacklist with regexes", function() {
			var blacklist = {
				foo: /^.ar$/i,
				hello: ['is it me you\'re looking for?', /baby/g]
			};
			var haystack = {
				fishSticks: 'awesome+=2',
				foo: 'char',
				hello: 'my baby'
			};
			var blacklisted = logUtil.matchesOneKey(haystack, blacklist);
			blacklisted.should.eql(true);
		});
		it("should pass an unmatched blacklist with a function", function() {
			var blacklist = {
				foo: function(val) { return val == 'bar'; }
			};
			var haystack = {
				foo: 'car'
			};
			var blacklisted = logUtil.matchesOneKey(haystack, blacklist);
			blacklisted.should.eql(false);
		});
		it("should fail a matched blacklist with a function", function() {
			var blacklist = {
				foo: function(val) {
					return val == 'bar';
				}
			};
			var haystack = {
				foo: 'bar'
			};
			var blacklisted = logUtil.matchesOneKey(haystack, blacklist);
			blacklisted.should.eql(true);
		});
	});
	describe("matchesAllKeys", function() {
		it("should fail when a key is missing", function() {
			var whitelist = {
				foo: 'bar',
				hello: 'world'
			};
			var haystack = {
				fishSticks: 'pretty cool',
				foo: 'bar'
			};
			var whitelisted = logUtil.matchesAllKeys(haystack, whitelist);
			whitelisted.should.eql(false);
		});
		it("should fail an unmatched 1:1 whitelist", function() {
			var whitelist = {
				foo: 'bar',
				hello: 'world'
			};
			var haystack = {
				fishSticks: 'awesome',
				foo: 'bar',
				hello: 'to my little friend'
			};
			var whitelisted = logUtil.matchesAllKeys(haystack, whitelist);
			whitelisted.should.eql(false);
		});
		it("should pass a matched 1:1 whitelist", function() {
			var whitelist = {
				foo: 'bar',
				hello: 'world'
			};
			var haystack = {
				fishSticks: 'still awesome',
				foo: 'bar',
				hello: 'world'
			};
			var whitelisted = logUtil.matchesAllKeys(haystack, whitelist);
			whitelisted.should.eql(true);
		});
		it("should fail an unmatched 1:many whitelist", function() {
			var whitelist = {
				foo: ['bar', 'car', 'scar', 'far'],
				hello: ['my lady', 'my honey', 'my ragtime gal']
			};
			var haystack = {
				fishSticks: 'increasingly awesome',
				foo: 'scar',
				hello: 'world'
			};
			var whitelisted = logUtil.matchesAllKeys(haystack, whitelist);
			whitelisted.should.eql(false);
		});
		it("should pass a matched 1:many whitelist", function() {
			var whitelist = {
				foo: ['bar', 'car', 'scar', 'far'],
				hello: ['my lady', 'my honey', 'my ragtime gal']
			};
			var haystack = {
				fishSticks: 'increasingly awesomer',
				foo: 'car',
				hello: 'my honey'
			};
			var whitelisted = logUtil.matchesAllKeys(haystack, whitelist);
			whitelisted.should.eql(true);
		});
		it("should fail an unmatched whitelist with regexes", function() {
			var whitelist = {
				foo: /^.ar$/i,
				hello: ['is it me you\'re looking for?', /baby/g]
			};
			var haystack = {
				fishSticks: 'awesome++',
				foo: 'car',
				hello: 'world'
			};
			var whitelisted = logUtil.matchesAllKeys(haystack, whitelist);
			whitelisted.should.eql(false);
		});
		it("should pass a matched whitelist with regexes", function() {
			var whitelist = {
				foo: /^.ar$/i,
				hello: ['is it me you\'re looking for?', /baby/g]
			};
			var haystack = {
				fishSticks: 'awesome+=2',
				foo: 'car',
				hello: 'my baby'
			};
			var whitelisted = logUtil.matchesAllKeys(haystack, whitelist);
			whitelisted.should.eql(true);
		});
	});
	describe("forEachObj", function() {
		it("should run once for each top-level element", function() {
			var obj = {one: 0, two: 0, three: 0},
				count = 0;
			logUtil.forEachObj(obj, function(key, val) {
				count++;
			});
			count.should.eql(3);
		});
		it("should call back for every element only once", function() {
			var obj = {one: 0, two: 0, three: 0};
			logUtil.forEachObj(obj, function (key, val) {
				obj[key] = val + 1;
			});
			obj.one.should.eql(1);
			obj.two.should.eql(1);
			obj.three.should.eql(1);
		});
		it("should stop when breakLoop is called", function() {
			var obj = {one: 0, two: 0, three: 0};
			logUtil.forEachObj(obj, function (key, val, breakLoop) {
				obj[key] = val + 1;
				if (key == 'two')
					breakLoop();
			});
			obj.one.should.eql(1);
			obj.two.should.eql(1);
			obj.three.should.eql(0);
		});
	});
	describe("freeKey", function() {
		it("should not change the key if it doesn't exist", function() {
			var obj = {foo: 'bar', hello: 'world'},
				result = logUtil.freeKey(obj, 'fishSticks');
			result.should.eql('fishSticks');
		});
		it("should append .0 if the key already exists", function() {
			var obj = {foo: 'bar', hello: 'world'},
				result = logUtil.freeKey(obj, 'hello');
			result.should.eql('hello0');
		});
		it("should increment until a free key is found", function() {
			var obj = {foo: 'bar', 'foo0': 'car', 'foo1': 'star'},
				result = logUtil.freeKey(obj, 'foo');
			result.should.eql('foo2');
		});
		it("should allow separator to be customized", function() {
			var obj = {foo: 'bar', foo_0: 'car'},
				result = logUtil.freeKey(obj, 'foo', '_');
			result.should.eql('foo_1');
		});
		it("should allow starting integer to be customized", function() {
			var obj = {foo: 'bar', foo_1: 'car'},
				result = logUtil.freeKey(obj, 'foo', '_', 1);
			result.should.eql('foo_2');
		});
	});
	describe("nonObjToString", function() {
		it("should convert valid values to string form", function() {
			logUtil.nonObjToString(undefined).should.eql('undefined');
			logUtil.nonObjToString(null).should.eql('null');
			logUtil.nonObjToString(5).should.eql('5');
			logUtil.nonObjToString('foo').should.eql('foo');
			logUtil.nonObjToString(true).should.eql('true');
			logUtil.nonObjToString(false).should.eql('false');
		});
		it("should return null for invalid values", function() {
			should.not.exist(logUtil.nonObjToString({}));
			should.not.exist(logUtil.nonObjToString(new Date()));
		});
	});
	describe("safeMerge", function() {
		it("should shallow merge two objects with no like keys", function() {
			var obj = {one: 1, two: 2},
				obj2 = {three: 3, four: 4};
			logUtil.safeMerge(obj, obj2);
			obj.should.have.property('one').and.eql(1);
			obj.should.have.property('two').and.eql(2);
			obj.should.have.property('three').and.eql(3);
			obj.should.have.property('four').and.eql(4);
			obj2.should.not.have.property('one');
		});
		it("should choose free keys on overlap", function() {
			var obj = {one: 1, two: 2},
				obj2 = {two: 2, three: 3};
			logUtil.safeMerge(obj, obj2);
			obj.should.have.property('two').and.eql(2);
			obj.should.have.property('two0').and.eql(2);
		});
		it("should support freeKey's customizations", function() {
			var obj = {one: 1, two: 2},
				obj2 = {two: 2, three: 3};
			logUtil.safeMerge(obj, obj2, '_', 2);
			obj.should.have.property('two_2').and.eql(2);
		});
	});
	describe("shallowMerge", function() {
		it("should shallow merge two objects with no like keys", function() {
			var obj = {one: 1, two: 2},
				obj2 = {three: 3, four: 4};
			logUtil.shallowMerge(obj, obj2);
			obj.should.have.property('one').and.eql(1);
			obj.should.have.property('two').and.eql(2);
			obj.should.have.property('three').and.eql(3);
			obj.should.have.property('four').and.eql(4);
			obj2.should.not.have.property('one');
		});
		it("should overwrite keys on overlap", function() {
			var obj = {one: 1, two: 2},
				obj2 = {two: 5, three: 3};
			logUtil.shallowMerge(obj, obj2);
			obj.should.have.property('two').and.eql(5);
		});
	});
});