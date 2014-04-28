# Bristol [![Build Status](https://travis-ci.org/TomFrost/Bristol.svg?branch=master)](https://travis-ci.org/TomFrost/Bristol)
Insanely configurable logging for Node.js

Sponsored by [Leadnomics](http://www.leadnomics.com).

## Why another logger?
NPM has no shortage of loggers.  Bristol was created to address a few common
shortcomings in the current pool of options:
- The message format should be decoupled from the message target (file,
console, etc). You never know what system will be ingesting log files.
- Structured logging should be the norm, _and simple log functions should
make that easy!_ No more shortcuts to `util.format`; if you're injecting
values into a string, chances are they should be logged under their own
keys.
- No restrictions on data type.  If you log an Error object, your logger
should know what to do with that.  Same goes for a string, an object, a
date, as well as application-specific data types.
- Lightweight! Why load modules that your configuration never uses? Bristol
lazy-loads everything it can.
- No callbacks, return values, or anything that would disincentivize a
developer from throwing in a quick log message.

Those points and more drove the development of a brand new breed of logging
library.  Introducing Bristol.

## Installation
In your project folder, type:

	npm install bristol --save

## Usage
### Quick start

```js
var log = require('bristol');
log.addTarget('console');

log.info("We're up and running!", {port: 3000});
```

Outputs (pretty-printed for README only):

```js
{
	"message": "We're up and running!",
	"date": "2014-04-09 00:45:37",
	"severity": "info",
	"file": "/path/to/my/file.js",
	"line": "4",
	"port": 3000
}
```

Bristol can now be require()'d in any other file, and the settings will follow
it.

### Customizing the output

```js
	log.addTarget('console')
		.withFormatter('human');

	log.debug("Hello, world", {event: 'bootstrap:welcome'});
```

Outputs:

```
[2014-04-09 00:53:59] DEBUG: Hello, world (/path/to/my/file.js:5)
	event: bootstrap:welcome
```

#### Available formatters
- **human:** Multi-line messages suitable for humans during development
- **json:** One line per message, valid json
- **syslog:** Syslog-compliant format, single-line
- **commonInfoModel:** Common Info Model format, friendly to many log
	aggregators. More human-readable than JSON with similar benefits. One
	line per message.

### Severity levels
By default, Bristol provides *error*, *warn*, *info*, *debug*, and *trace*
severity levels.  These can be called as function names from the log object,
or passed to the `log` function as the first parameter.

To change these levels to something else:

```js
// List in order from MOST to LEAST severe:
log.setSeverities(['panic', 'omg', 'uhoh', 'crap', 'ok']);

// Functions matching the provided severities now exist
log.panic("WHAT ARE WE GOING TO DO?!");
log.log('omg', new Error("Something failed."));

// The old ones do not.
log.debug("This will throw an exception now");
log.log('trace', "So will this.");
```

### Transforming your data types
Bristol allows you to send near-infinite arguments to the logging functions,
and attempts to intelligently turn those into useful log messages.  If your
application has its own data structures, it can be useful to inform Bristol
of them so that only pertinent values are logged if one of those is passed to
a logging function.

```js
log.addTransform(function(elem) {
	// This function should return data that should be logged instead of
	// the raw 'elem', or NULL if 'elem' isn't a type that we care about.
	if (elem.userName && elem.userId) {
		// elem is our enormous proprietary user object!
		return {
			username: elem.userName,
			connected: elem.lastSuccessfulConnection,
			ping: elem.getLastPingTime()
		};
	}
	return null;
});

// Now our "incomingConn" user object will just add its 3 most important
// properties to the resulting log message, rather than all of them.
log.info("New connection", incomingConn, {connections: server.getUserCount()});
```

### Setting global log values
Do you need certain pieces of information logged with every message?

```js
log.addGlobal('hostname', require('os').hostname());
log.addGlobal('msg_uuid', function() {
    return uuid.v4();
});

log.info("This message contains both of those key/value pairs!");
```

Functions provided to `addGlobal` will be executed for every log message.
Note that they're only called once per message even if multiple
targets have been added; therefore, the uuid in the example above will be
consistent across *all* configured targets.

Of course, you can also delete globals with:

```js
log.deleteGlobal('msg_uuid');
```

### Restricting targets to certain severities

```js
// high_priority.log will contain only errors and warns
log.addTarget('file', {file: '/tmp/high_priority.log'})
	.withLowestSeverity('warn');

// debug.log will only store debug messages
log.addTarget('file', {file: '/tmp/debug.log'})
	.withLowestSeverity('debug')
	.withHighestSeverity('debug');

// The console will only output trace messages
log.addTarget('console')
	.withHighestSeverity('trace');
```

### Restricting targets to certain types of messages
Sometimes, even within a severity level, it can be useful to filter out some
kinds of log messages.  Bristol leverages its key/value logging to allow you
to blacklist or whitelist messages on a target, based on the values of certain
keys.

```js
// Don't log messages with event=disconnect, OR messages for certain channels
log.addTarget('console')
	.withFormatter('human')
	.excluding({
		event: 'disconnect',
		channel: ['#help', /^#anime.*$/]
	});

// Only log the trace messages with event starting with "test", from userId
// 1, 2, or 3, and with destination set to a test server.
log.addTarget('file')
	.withFormatter('commonInfoModel')
	.withHighestSeverity('trace')
	.onlyIncluding({
		event: /^test:/,
		userId: [1, 2, 3],
		destination: function(val) { return isTestServer(val); }
```

Restrictions on keys can be static types like strings or numbers, RegExp
objects to check for a match, functions to test the value each time the
target is hit, or arrays of any of the above to allow more than one match.
Exclusions and inclusions can also be combined in one target to summon
Captain Planet.

### More than one logger
Have a use case that requires more than one 'log' object, so you can maintain
different sets of targets?  No problem:

```js
var log2 = new log.Bristol();
```

The default log object will remain the default, but now log2 is a completely
independent instance with zero configuration.

### Extensions
Instead of passing in a target or formatter as a string, you can pass your
own functions!  Both of these modules are simply functions that take an
options object as the first argument, and context-specific arguments after
that.  Check out some of the built-in targets and formatters for examples.
They're super easy!

## Testing
Testing requires the grunt-cli package to be globally installed.  Do that with:

    npm install -g grunt-cli

And then test with:

    npm test

## License
Bristol is distributed under the MIT license.

## Credits
Bristol was created by Tom Frost at Leadnomics in 2014.
