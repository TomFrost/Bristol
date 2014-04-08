/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

const DEFAULT_SEPARATOR = '';

var util = require('util');

/**
 * Cycles through the top-level enumerable elements of an object, calling a
 * callback for each key/value pair.  Looping will continue until all elements
 * have been handled, or until the supplied 'brake' argument is called.
 * @param {{}} obj An object whose elements will be iterated through.
 * @param {function} cb A callback function to be called sequentially and
 *      synchronously for each element.  Arguments are:
 *          - {string} key: The key of the element
 *          - {*} value: The value of the element
 *          - {function} brake: A function that can be called to halt
 *              the loop after the current callback completes.
 */
function forEachObj(obj, cb) {
	var brakesOn = false,
		brake = function() { brakesOn = true; };
	for (var key in obj) {
		if (obj.hasOwnProperty(key))
			cb(key, obj[key], brake);
		if (brakesOn) break;
	}
}

/**
 * Finds a free, unused key in an object, given an object and the requested key
 * name. If necessary, the key name will be appended with an optional separator
 * char, and the first available integer.
 *
 * For example, if {foo: 'bar'} were supplied with 'foo' as the requested key,
 * this function would (by default) return foo0, or foo1 if foo0 were already
 * defined, and so on.
 * @param {{}} obj The object to be searched for a free key
 * @param {string} key The key name to be checked and possibly augmented
 * @param {string|null} [separator] An optional separator to put between the
 *      original key name and the integer. Default is no separator.
 * @param {number} [start] The integer at which to start, if the given key is
 *      already defined in the given object.  Default 0.
 * @returns {string} The first available key
 */
function freeKey(obj, key, separator, start) {
	var origKey = key,
		curVal = start || 0,
		sep = typeof separator == 'string' ? separator : DEFAULT_SEPARATOR;
	while (obj.hasOwnProperty(key))
		key = origKey + sep + curVal++;
	return key;
}

/**
 * Checks if a supplied object has all keys defined in a search object, and
 * that the values of the supplied object match one of the values in the
 * search object's array.
 *
 * The search object can look something like this, containing strings for an
 * equality check, RegExp objects to check for a match, or functions that
 * accept the value as an argument and return true to indicate a match, or
 * false otherwise:
 *
 * {
 *     foo: ['bar', 'car', 'far'],
 *     hello: ['world', /^my (baby|honey|ragtime gal)$/i],
 *     fish: function(val) { return val.length && val[0] == 's'; }
 * }
 *
 * The following haystack would match the above:
 *
 * {
 *     foo: 'bar',
 *     hello: 'my baby',
 *     fish: 'sticks',
 *     other: 'arg'
 * }
 *
 * This object would not, because it's missing the 'fish' key, and the value of
 * 'hello' does not match:
 *
 * {
 *     foo: 'car',
 *     hello: 'ladies'
 * }
 * @param {{}} haystack An object to be tested against a collection of
 *      key/value pairs that define legal contents
 * @param {{}} needlesObj An object mapping keys to a string or regexp, or an
 *      array of strings/regexps, one of which needing to match each
 *      corresponding key of the haystack to pass
 * @returns {boolean} true if every key from the needlesObj exists and matches
 *      associated keys in the haystack; false otherwise.
 */
function matchesAllKeys(haystack, needlesObj) {
	var foundAll = true;
	forEachObj(needlesObj, function(key, val, brake) {
		if (!haystack.hasOwnProperty(key))
			foundAll = false;
		else
			foundAll = matchesOneValue(haystack[key], val);
		if (!foundAll) brake();
	});
	return foundAll;
}

/**
 * Checks if a supplied object has at least one key whose value matches one of
 * of the values specified in the needlesObj object with the corresponding key.
 *
 * Similar to {@link #matchesAllKeys}, but returns true is only one key
 * matches, rather than all of them.
 * @param {{}} haystack An object to be tested against a collection of
 *      key/value pairs that define possible contents
 * @param {{}} needlesObj An object mapping keys to a string or regexp, or an
 *      array of strings/regexps, one of which needing to match one or more
 *      corresponding keys of the haystack to pass
 * @returns {boolean} true if at least one key from the haystack exists and
 *      matches a value of the corresponding key in the needlesObj; false
 *      otherwise.
 */
function matchesOneKey(haystack, needlesObj) {
	var found = false;
	forEachObj(needlesObj, function(key, val, brake) {
		if (haystack.hasOwnProperty(key)) {
			found = matchesOneValue(haystack[key], val);
			if (found) brake();
		}
	});
	return found;
}

/**
 * Checks if a supplied string matches at least one of the values in an array
 * of needles.  The needles array can contain strings for an equality check, a
 * RegExp object to check for a match, or a function that accepts the value as
 * an argument and returns true to indicate a match, or false otherwise.
 * @param {string} haystack A string to be tested for matches
 * @param {Array.<string|RegExp>|string|RegExp} needles A string, RegExp, or
 *      an array containing strings/Regexps against which the haystack should
 *      be tested.  Testing will halt when the first match is found.
 * @returns {boolean} true if a match was found; false otherwise.
 */
function matchesOneValue(haystack, needles) {
	var found = false;
	if (!util.isArray(needles))
		needles = [needles];
	for (var i = 0; i < needles.length; i++) {
		if (typeof needles[i] == 'function')
			found = needles[i](haystack);
		else if (util.isRegExp(needles[i]))
			found = !!haystack.match(needles[i]);
		else
			found = haystack === needles[i];
		if (found) break;
	}
	return found;
}

/**
 * Converts a non-object type (with the exception of 'null') to a
 * human-readable string.  If the supplied element is an object or cannot be
 * otherwise converted, null is returned.
 * @param {*} elem The element to be converted
 * @returns {string|null} The string version of the element, or null if no
 *      conversion could be made.
 */
function nonObjToString(elem) {
	if (elem === null)
		return 'null';
	if (typeof elem !== 'object') {
		switch (typeof elem) {
			case 'undefined': return 'undefined';
			case 'boolean': return elem ? 'true' : 'false';
			default:
				try {
					return elem.toString();
				}
				catch (e) {}
		}
	}
	return null;
}

/**
 * Merges the top-level keys/values from one object into another, choosing new
 * key names if a key to be merged already exists in the destination object.
 * The key selection process is defined by {@link #freeKey}. Note that the
 * first supplied object will be physically changed; it's returned by this
 * function for convenience only.
 * @param {{}} destObj The object into which other keys will be merged
 * @param {{}} obj The object from which keys will be sent into the destObj
 * @param {string} [separator] An optional separator character between the
 *      name of a conflicting key and an appended integer to make the key name
 *      unique. Default none.
 * @param {number} [start] An integer with which to start incrementing numbers
 *      to append to any afflicting key. Default 0.
 * @returns {*} The destObj, post-merge.
 */
function safeMerge(destObj, obj, separator, start) {
	forEachObj(obj, function(key, val) {
		destObj[freeKey(destObj, key, separator, start)] = val;
	});
	return destObj;
}

/**
 * Merges the top-level keys/values from one object into another, overwriting
 * any keys in the first object that appear in the second.  Note that the
 * first supplied object will be physically changed; it's returned by this
 * function for convenience only.
 * @param {{}} destObj The object into which other keys will be merged
 * @param {{}} obj The object from which keys will be sent into the destObj
 * @returns {*} The destObj, post-merge.
 */
function shallowMerge(destObj, obj) {
	forEachObj(obj, function(key, val) {
		destObj[key] = val;
	});
	return destObj;
}

module.exports = {
	forEachObj: forEachObj,
	freeKey: freeKey,
	matchesAllKeys: matchesAllKeys,
	matchesOneKey: matchesOneKey,
	matchesOneValue: matchesOneValue,
	nonObjToString: nonObjToString,
	safeMerge: safeMerge,
	shallowMerge: shallowMerge
};
