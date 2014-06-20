/*
 * Bristol
 * Copyright 2014 Tom Frost
 */

var loggly = require('loggly');

var logglyClients = {};

function getLogglyClient(token, subdomain, username, password, tags) {
	var cid = token + subdomain;
	if (!logglyClients[cid]) {
		var opts = {
			token: token,
			subdomain: subdomain,
			auth: {
				username: username,
				password: password
			}
		};
		if (tags) {
			if (!Array.isArray(tags)) {
				tags = [tags];
			}
			opts.tags = tags;
		}
		logglyClients[cid] = loggly.createClient(opts);
	}
	return logglyClients[cid];
}

/**
 * Pushes a log message to loggly
 * @param {Object} options  Map of options to customize Loggly
 * @param {string} options.token Your loggly token
 * @param {string} options.subdomain Loggly subdomain
 * @param {string} options.username Loggly username
 * @param {string} options.password Loggly password
 * @param {Array|string} [options.tags] Global Loggly tags
 * @param {string} severity The severity of the log message
 * @param {Date} date The date of the log message
 * @param {string} message The message to be pushed to loggly
 */
function log(options, severity, date, message) {
	var client = getLogglyClient(options.token, options.subdomain,
			options.username, options.password, options.tags),
		tags = options.tags || null;

	client.log(message, tags, function(err) {
		if (err) {
			console.log("Error publishing log message to Loggly: " + err +
				"Message was: " + message);
		}
	});
}

module.exports = log;