# Bristol Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## [Development]
### Changed
- Bristol has been updated to ES6 and is compatible with Node.js 4 LTE and up

## [v0.3.3]
### Changed
- Use istanbul for coverage instead of Grunt/Blanket

### Fixed
- Massively speed up origin detection (bartekn PR #12)

## [v0.3.2]
### Fixed
- Don't assume all errors have stack traces

## [v0.3.1]
### Fixed
- Human formatter now outputs pretty-printed JSON when it encounters an object literal instead of "[object Object]".
- CommonInfoModel formatter now replaces all double-quotes with single-quotes, instead of just the first.

## [v0.3.0]
### Added
- Loggly target
- Better documentation regarding targets

## [v0.2.2]
### Fixed
- Error objects not being properly sent to log targets

## [v0.2.1]
### Fixed
- Minor inaccuracies in README examples
- Options were improperly sent to target functions

## [v0.2.0]
### Added
- Human formatter
- CommonInfoModel formatter
- Syslog formatter
- File target
- Travis CI testing
- Incredible amounts of docs

### Fixed
- Move dateformat to constant in CommonInfoModel and Syslog formatters
- Remove comma separator from date elements in JSON formatter
- Options documentation in JSON formatter
- Target and formatter paths

## v0.1.0
- **Initial Release**

[Development]: https://github.com/TomFrost/Bristol/compare/0.3.3...HEAD
[v0.3.3]: https://github.com/TomFrost/Bristol/compare/0.3.2...0.3.3
[v0.3.2]: https://github.com/TomFrost/Bristol/compare/0.3.1...0.3.2
[v0.3.1]: https://github.com/TomFrost/Bristol/compare/0.3.0...0.3.1
[v0.3.0]: https://github.com/TomFrost/Bristol/compare/0.2.2...0.3.0
[v0.2.2]: https://github.com/TomFrost/Bristol/compare/0.2.1...0.2.2
[v0.2.1]: https://github.com/TomFrost/Bristol/compare/0.2.0...0.2.1
[v0.2.0]: https://github.com/TomFrost/Bristol/compare/0.1.0...0.2.0
