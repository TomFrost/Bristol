/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

const DEFAULT_MESSAGE_KEY = 'message';
const DEFAULT_SEVERITY_KEY = 'severity';
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

var logUtil = require('../Util'),
	moment = require('moment');

/**
 * The Common Info Model format defines a log message as a series of key/value
 * pairs following a date, in the configuration:
 *
 * 2014-04-07 23:06:32 severity="info" event="user:login" username="todd"
 *      connectionsToday=5
 *
 * True CIM format cannot be enforced by this formatter, however, as it also
 * includes a consistent naming scheme that must be implemented at the
 * application level.
 * @param {{[messageKey], [severityKey]}} options json
 *      accepts the following options:
 *          - {string} messageKey: The name of the key used to collect
 *            non-object elements
 *          - {string} severityKey: The name of the key used for the severity
 * @param {string} severity The log severity
 * @param {Date} date The log date
 * @param {Array} elems An array of elements to be logged
 * @returns {string} The message to be logged
 */
module.exports = function(options, severity, date, elems) {
	var msgKey = options.messageKey || DEFAULT_MESSAGE_KEY,
		sevKey = options.severityKey || DEFAULT_SEVERITY_KEY,
		obj = {},
		msg = moment(date).format(DEFAULT_DATE_FORMAT);
	obj[msgKey] = '';
	obj[sevKey] = severity;
	elems.forEach(function(elem) {
		var str = logUtil.nonObjToString(elem);
		if (str !== null)
			obj[msgKey] += ' ' + sanitize(str);
		else if (elem instanceof Error) {
			obj[msgKey] += ' <Err: ' + sanitize(elem.message) + '>';
			logUtil.safeMerge(obj, {
				stackTrace: sanitize(elem.stack)
			});
		}
		else if (elem instanceof Date)
			obj[msgKey] += ' ' + moment(elem).format(DEFAULT_DATE_FORMAT);
		else if (typeof elem == 'object')
			logUtil.safeMerge(obj, elem);
	});
	if (obj[msgKey])
		obj[msgKey] = obj[msgKey].substr(1);
	else
		delete obj[msgKey];
	// Construct message
	logUtil.forEachObj(obj, function(key, val) {
		msg += ' ' + key + '="' + getLoggable(val) + '"';
	});
	return msg;
};

function getLoggable(val) {
	var str = logUtil.nonObjToString(val);
	if (str)
		return sanitize(str);
	if (val instanceof Error)
		return '<Err: ' + sanitize(val.message) + '>';
	if (val instanceof Date)
		return moment(val).format(DEFAULT_DATE_FORMAT);
	else
		return sanitize(JSON.stringify(val));
}

function sanitize(str) {
	str = str.replace('"', "'");
	str = str.replace(/\s*\n\s*/g, ' | ');
	return str;
}