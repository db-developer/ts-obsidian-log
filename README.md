[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![jsdoc](https://img.shields.io/static/v1?label=jsdoc&message=%20api%20&color=blue)](https://jsdoc.app/)
![Build & Test](https://github.com/db-developer/ts-obsidian-log/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/db-developer/ts-obsidian-log/branch/master/graph/badge.svg)](https://codecov.io/gh/db-developer/ts-obsidian-log)

[BOTTOM](#project-structure) [CHANGELOG](CHANGELOG.md) [LICENSE](LICENSE) [ROADMAP](ROADMAP.md)

# Obsidian Log Utility

A small, self-contained logging utility designed for use inside **Obsidian plugins**.

This module provides a structured `Log` class and related types to unify console logging
and user-facing notices, while respecting configurable log levels.

The primary design goal is **safe integration into Obsidian plugins via bundling**.
The module is **not intended to be loaded dynamically at runtime**.

---

## Motivation

Obsidian plugins run in a constrained environment:

- External runtime dependencies are discouraged
- `node_modules` are typically not shipped with plugins
- All code should be bundled into the final plugin file

This module is therefore designed to:

- Have **no external runtime dependencies**
- Integrate cleanly with Obsidian’s `Notice` API
- Be **bundled (e.g. via Rollup)** directly into the plugin output
- Provide consistent logging and notice behavior across multiple plugins

---

## Features

- Unified logging interface (`debug`, `info`, `warn`, `error`, `log`)
- Configurable log levels
- Automatic plugin name prefix for console output
- User-facing notices via Obsidian’s `Notice`
- Clear separation between logging severity and notice display
- Fully type-safe (TypeScript)

---

## Installation

This package is intended to be used as a **build-time dependency**.

```bash
pnpm add <your-package-name> --save-dev
# or
npm install <your-package-name> --save-dev
```

> Important:
> This module must be bundled into your plugin.
> It must not be shipped as an external runtime dependency.

---

## Usage

### Importing

```ts
import { Log } from "<your-package-name>";
import type { LogLevel, LogSettings } from "<your-package-name>";
```

### Initialization

```ts
const log = Log.init("my-plugin", {
  loglevel: "info",
});
```

The plugin name is automatically prepended to all console output.

---

## Logging Methods

```ts
log.debug("Debug message");
log.info("Information");
log.warn("Warning");
log.error(new Error("Something went wrong"));
log.log("Neutral log message");
```

Output depends on the configured log level.

⚠️ Note for Debug Output:

On the **very first call** to `log.debug()`, you may see a console warning like:

```
Debug output may not be visible unless Chrome DevTools are set to 'Verbose'.
```

This message appears only once per session and is intended to alert developers
that debug messages may not appear in Chrome unless the console's verbosity is
set appropriately.
Chrome's console verbosity is outside the control of this module and cannot be
changed programmatically.

---

## Notices

The `notice()` method combines logging with Obsidian UI notices.

```ts
log.notice("Saved successfully", "success");
log.notice("Something looks odd", "warn");
log.notice("Operation failed", new Error("Failure"));
```

Behavior:

- Messages are logged according to the resolved log level
- Notices are always shown (except for `debug`)
- Errors include their message and stack
- Notice styling uses the following CSS classes:
  - `notice-error`
  - `notice-warn`
  - `notice-info`
  - `notice-success`

---

## Log Level Resolution

| Input                  | Resolved Log Level |
|------------------------|--------------------|
| Error                  | error              |
| "error"                | error              |
| "warn"                 | warn               |
| "success"              | debug              |
| "debug"                | debug              |
| "log"                  | log                |
| "info" / undefined     | info               |

---

## Bundling (Required)

Obsidian does not support loading external npm modules at runtime.
All dependencies must be bundled.

### Rollup Example

```js
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
  },
  plugins: [
    resolve(),
    typescript(),
  ],
  external: ["obsidian"],
};
```

---

## Build-time Injection of __PLUGIN_NAME__

This module supports an optional **build-time injected plugin name**
via the global constant `__PLUGIN_NAME__`.

When present, this value is used as a fallback plugin identifier
if no explicit name is provided to `Log.init()`.

### Rollup Configuration

```js
import replace from "@rollup/plugin-replace";

replace({
  preventAssignment: true,
  values: {
    __PLUGIN_NAME__: JSON.stringify("my-plugin"),
  },
});
```

Resolution order:

1. Explicit argument passed to Log.init(...)
2. Build-time injected __PLUGIN_NAME__
3. Fallback literal "unknown-plugin"

---

## Project Structure

```
src/
├── log.ts
├── index.ts
```

`index.ts` only re-exports the public API.

[TOP](#obsidian-log-utility) [CHANGELOG](CHANGELOG.md) [LICENSE](LICENSE) [ROADMAP](ROADMAP.md)
