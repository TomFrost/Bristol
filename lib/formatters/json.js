/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

const DEFAULT_MESSAGE_KEY = 'message';
const DEFAULT_DATE_KEY = 'date';
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DEFAULT_SEVERITY_KEY = 'severity';

var logUtil = require('../Util'),
	moment = require('moment');

/**
 * The json formatter concatenates all non-object elements into a message
 * key, merges it with the other objects, and json-serializes it.  The date
 * and severity are also added to this object.
 * @param {{[messageKey], [dateKey], [dateFormat], [severityKey]}} options json
 *      accepts the following options:
 *          - {string} messageKey: The name of the key used to collect
 *            non-object elements
 *          - {string} dateKey: The name of the key used for the date
 *          - {string} severity: The name of the key used for the severity
 *          - {string} dateFormat: The format to use for the date. Should
 *            follow the date formatting spec for Moment, found at:
 *            http://momentjs.com/docs/#/parsing/string-format/.
 *            Default: 'YYYY-MM-DD HH:mm:ss'
 * @param {string} severity Unused
 * @param {Date} date Unused
 * @param {Array} elems An array of elements to be logged
 * @returns {string} The message to be logged
 */
module.exports = function(options, severity, date, elems) {
	var msgKey = options.messageKey || DEFAULT_MESSAGE_KEY,
		dateKey = options.dateKey || DEFAULT_DATE_KEY,
		dateFormat = options.dateFormat || DEFAULT_DATE_FORMAT,
		sevKey = options.severityKey || DEFAULT_SEVERITY_KEY,
		obj = {};
	obj[msgKey] = '';
	obj[dateKey] = moment(date).format(dateFormat);
	obj[sevKey] = severity;
	elems.forEach(function(elem) {
		var str = logUtil.nonObjToString(elem);
		if (str !== null)
			obj[msgKey] += ' ' + str;
		else if (elem instanceof Error) {
			obj[msgKey] += ' <Err: ' + elem.message + '>';
			logUtil.safeMerge(obj, {
				stackTrace: elem.stack.replace(/\s*[\n\r]+\s*/g, ' | ')
			});
		}
		else if (elem instanceof Date)
			obj[msgKey] += ', ' + moment(elem).format(dateFormat);
		else if (typeof elem == 'object')
			logUtil.safeMerge(obj, elem);
	});
	if (obj[msgKey])
		obj[msgKey] = obj[msgKey].substr(1);
	else
		delete obj[msgKey];
	return JSON.stringify(obj);
};
