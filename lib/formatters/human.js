/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

var logUtil = require('../Util'),
	moment = require('moment');

/**
 * The human format is excellent for human-readable logging during development,
 * but is often a poor choice for long-term or aggregated logging due to taking
 * up more than one line per message, with significant whitespace for
 * formatting.  A human-formatted message looks like this:
 *
 * [2014-04-07 22:14:48] INFO: User connected (/path/to/myFile.js:245)
 *      userId: 575
 *      userName: t3h PeNgU1N oF d00m
 *      accountType: paid
 *      connectionsToday: 3
 *
 * @param {{[dateFormat]}} options json
 *      accepts the following options:
 *          - {string} dateFormat: The format to use for the date. Should
 *            follow the date formatting spec for Moment, found at:
 *            http://momentjs.com/docs/#/parsing/string-format/.
 *            Default: 'YYYY-MM-DD HH:mm:ss'
 * @param {string} severity Log message severity
 * @param {Date} date Log message date
 * @param {Array} elems An array of elements to be logged
 * @returns {string} The message to be logged
 */
module.exports = function(options, severity, date, elems) {
	var obj = {},
		dateFormat = options.dateFormat || DEFAULT_DATE_FORMAT,
		title = '',
		msg = '';

	date = moment(date).format(dateFormat);
	elems.forEach(function(elem) {
		var str = logUtil.nonObjToString(elem);
		if (str !== null)
			title += ' ' + str;
		else if (elem instanceof Error) {
			title += ' <Err: ' + elem.message + '>';
			logUtil.safeMerge(obj, {
				stackTrace: sanitize(elem.stack)
			});
		}
		else if (elem instanceof Date)
			title += ' ' + moment(elem).format(dateFormat);
		else if (typeof elem == 'object')
			logUtil.safeMerge(obj, elem);
	});
	if (title)
		title = title.substr(1);
	msg = '[' + date + '] ' + severity.toUpperCase() + ': ' + title;
	if (obj.file && obj.line) {
		msg += ' (' + obj.file + ':' + obj.line + ')';
		delete obj.file;
		delete obj.line;
	}
	logUtil.forEachObj(obj, function(key, val) {
		var strVal = '';
		try {
			strVal = val.toString();
			if (strVal === '[object Object]') {
				// Pretty-print objects with JSON
				strVal = ("\n" + JSON.stringify(val, null, "    "))
					.replace(/\n/g, "\n\t    ");
			}
		}
		catch (e) {}
		msg += "\n\t" + key + ': ' + strVal;
	});
	return msg;
};

function sanitize(str) {
	if (str)
		str.replace(/\n\s*/g, "\n\t\t");
	return str;
}