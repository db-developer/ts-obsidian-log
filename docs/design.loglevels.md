# Comparison: `enum` vs `const + type` for Log Levels

When designing a logger in TypeScript, one common choice is whether to use an `enum` or a `const` array with a derived type for log levels. Below is a comparison of the two approaches.

| Aspect | `enum` | `const + type` |
|--------|--------|----------------|
| **Type Safety** | ✔ Provides compile-time safety, values are restricted to the enum members. | ✔ Provides compile-time safety via a derived union type from the array. |
| **Runtime Presence** | ✔ Generates a runtime object in JavaScript. | ✖ Only exists at the type level; minimal runtime overhead. |
| **String Representation / Persistence** | ⚠ Needs mapping when storing as string (JSON, config files). | ✔ Native strings, ideal for persistent settings (JSON, Obsidian config). |
| **Order / Comparisons** | ✔ Numeric enums allow direct comparison (`<=`) if using numbers. | ✔ Requires additional mapping (`LOG_LEVEL_ORDER`) for numeric comparisons. |
| **Extensibility** | ⚠ Adding new levels may require updating multiple places (enum + mapping). | ✔ Adding a new level in the array automatically updates type and runtime checks. |
| **Bundle Size / Overhead** | ⚠ Adds runtime code for the enum object. | ✔ Minimal; only the array exists in JS output. |
| **Runtime Validation** | ⚠ Requires extra code to validate a string against enum values. | ✔ Simple runtime check (`LOG_LEVELS.includes(value)`). |

## LOG_LEVEL_ORDER Visualization

For `const + type`, numeric comparisons are handled via a mapping:

```ts
const LOG_LEVELS = ["none", "error", "warn", "debug", "log", "info"] as const;
type LogLevel = typeof LOG_LEVELS[number];

// note: for visualization purposes only
const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  none: 0,
  error: 10,
  warn: 20,
  debug: 30,
  log: 40,
  info: 50,
};

// Example usage:
const currentLevel: LogLevel = "log";
const messageLevel: LogLevel = "debug";

if (LOG_LEVEL_ORDER[messageLevel] <= LOG_LEVEL_ORDER[currentLevel]) {
  console.log("This message will be logged.");
}
```

## Summary

- **`enum`** is suitable if you want a numeric-based, self-contained logging system and don’t mind extra runtime code.  
- **`const + type`** is preferable when you need:  
  - lightweight runtime footprint  
  - easy persistence as strings (JSON/config)  
  - runtime validation  
  - flexible ordering and future expansion  

**Conclusion:** For plugin development (like Obsidian), `const + type` is generally more practical, maintainable, and type-safe while avoiding unnecessary bundle code.
