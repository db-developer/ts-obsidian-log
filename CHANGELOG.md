[BOTTOM](#100---2026-01-01) [LICENSE](LICENSE) [ROADMAP](ROADMAP.md) [README](README.md)

# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- No additions yet

### Changed

- No changes yet

### Fixed

- No fixes yet

## [1.0.2] - 2026-01-02

### Added

- __PLUGIN_NAME__ - allows rollup to inject a plugin name at build time.
- debugwarning for chromes devtools

### Changed

- Log is a singleton now.

## [1.0.1] - 2026-01-02

### Fixed

- type exports

### Changed

- refactoring of modules
- code test coverage 100% now

## [1.0.0] - 2026-01-01

- Initial version

### Features

- Centralized Log class for Obsidian plugins
- Configurable log levels (none, error, warn, info, log, debug)
- Automatic plugin name prefix for all console output
- Unified handling of console logging and Obsidian Notice messages
- Consistent mapping between notice levels and log levels
- Error-aware logging with automatic error formatting
- Typed public API with exported log-related types
- Zero runtime dependencies, fully bundle-friendly
- Designed for Rollup-based integration into Obsidian plugins
- Comprehensive unit test coverage for all public behavior

[TOP](#changelog) [LICENSE](LICENSE) [ROADMAP](ROADMAP.md) [README](README.md)