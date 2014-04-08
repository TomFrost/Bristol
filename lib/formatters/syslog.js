/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

const DEFAULT_SEVERITY_KEY = 'severity';

var logUtil = require('../Util'),
	moment = require('moment'),
	os = require('os');

/**
 * The Syslog format implements the syslog standard as defined in RFC 5424.
 * Note that it is STRONGLY suggested to set the severity levels to the
 * eight defined in section 6.2.1 of the Syslog RFC, linked below, when using
 * this formatter.  For convenience, these are:
 *
 * ['panic', 'alert', 'crit', 'error', 'warn', 'notice', 'info', 'debug']
 *
 * "panic" is optionally "emerg", and "error" is optionally "err".  The
 * resulting log message will be similar to:
 *
 * Apr 8 07:56:24 hostname node[2032]: Uncaught exception. severity=panic
 *      file=/path/to/file.js line=28 status="shutting down"
 *
 * @param {{[severityKey]}} options syslog accepts the following options:
 *          - {string} severityKey: The name of the key used for the severity
 * @param {string} severity The log severity
 * @param {Date} date The log date
 * @param {Array} elems An array of elements to be logged
 * @returns {string} The message to be logged
 # @see http://tools.ietf.org/html/rfc5424
 */
module.exports = function(options, severity, date, elems) {
	var sevKey = options.severityKey || DEFAULT_SEVERITY_KEY,
		dateFormat = 'YYYY-MM-DD HH:mm:ss',
		obj = {},
		line = moment(date).format('MMM d HH:mm:ss') + ' ' + os.hostname() +
			' ' + process.title + '[' + process.pid + ']:',
		msg = '';
	obj[sevKey] = severity;
	elems.forEach(function(elem) {
		var str = logUtil.nonObjToString(elem);
		if (str !== null)
			msg += ' ' + sanitize(str);
		else if (elem instanceof Error) {
			msg += ' <Err: ' + sanitize(elem.message) + '>';
			logUtil.safeMerge(obj, {
				stackTrace: sanitize(elem.stack)
			});
		}
		else if (elem instanceof Date)
			msg += ' ' + moment(elem).format(dateFormat);
		else if (typeof elem == 'object')
			logUtil.safeMerge(obj, elem);
	});
	// Construct message
	line += msg;
	logUtil.forEachObj(obj, function(key, val) {
		line += ' ' + key + '=' + getLogVal(val);
	});
	return line;
};

function getLogVal(val) {
	var str = logUtil.nonObjToString(val),
		logVal = '';
	if (str)
		logVal = sanitize(str);
	else if (val instanceof Error)
		logVal = '<Err: ' + sanitize(val.message) + '>';
	else if (val instanceof Date)
		logVal = moment(val).format(dateFormat);
	else
		logVal = sanitize(JSON.stringify(val));
	if (logVal.indexOf(' ') >= 0)
		logVal = '"' + logVal.replace('"', '\\"') + '"';
	return logVal;
}

function sanitize(str) {
	str = str.replace(/\s*\n\s*/g, ' | ');
	return str;
}
