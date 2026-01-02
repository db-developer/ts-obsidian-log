[BOTTOM](#philosophy) [CHANGELOG](CHANGELOG.md) [LICENSE](LICENSE) [README](README.md)

# Roadmap

This document outlines the planned and potential future development of the Obsidian Log Utility.
The roadmap is intentionally lightweight and pragmatic.

---

## Current State

- Stable `Log` class with configurable log levels
- Console logging with plugin name prefix
- Integration with Obsidian `Notice`
- Fully bundled, no runtime dependencies
- Comprehensive unit test coverage

---

## Short-Term Goals

### 1. API Stabilization
- Review public API for long-term stability
- Ensure backwards compatibility for minor updates
- Lock down exported types and helpers

### 2. Documentation Improvements
- Add concise usage examples for common Obsidian plugin patterns
- Document recommended Rollup configurations more explicitly
- Provide troubleshooting notes for bundling issues

---

## Mid-Term Ideas

### 3. Extended Configuration
- ✔ ~~Support for temporarily elevating log level (e.g. debug sessions)~~ as of version 1.0.1

### 4. Notice Customization
- Optional configuration for notice duration
- Optional opt-out for automatic notices per call

---

## Long-Term Considerations

### 5. Plugin-Wide Integration
- ✔ ~~Helper for integrating with Obsidian plugin settings UI~~ as of version 1.0.1
- ✔ ~~Standardized settings schema for reuse across plugins~~ as of version 1.0.0

### 6. Advanced Logging
- Structured logging (key/value metadata)
- Optional log grouping or namespaces
- Logging to files

---

## Non-Goals

The following are explicitly out of scope:

- Runtime dependency loading
- Network-based logging or telemetry
- External configuration files
- Heavy logging frameworks

---

## Philosophy

This project prioritizes:

- Simplicity over feature richness
- Predictable behavior over flexibility
- Build-time integration over runtime complexity

Features are added only if they align with these principles.

[TOP](#roadmap) [CHANGELOG](CHANGELOG.md) [LICENSE](LICENSE) [README](README.md)