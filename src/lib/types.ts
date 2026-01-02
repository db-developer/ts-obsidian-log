export const NONE = "none" as const;
export const ERROR = "error" as const;
export const WARN = "warn" as const;
export const DEBUG = "debug" as const;
export const LOG = "log" as const;
export const INFO = "info" as const;
export const SUCCESS = "success" as const;

/**
 * An object containing all valid log level strings for the logger.
 *
 * This serves as the single source of truth for log level values
 * across the codebase. Using these constants ensures type safety
 * and prevents repeated string literals.
 *
 * Each key maps to its string value:
 * - `NONE`  – disables all logging
 * - `ERROR` – logs errors only
 * - `WARN`  – logs warnings and errors
 * - `DEBUG` – logs debug messages, warnings, and errors
 * - `LOG`   – logs general messages, debug, warnings, and errors
 * - `INFO`  – logs informational messages, general logs, debug, warnings, and errors
 *
 * Example usage:
 * ```ts
 * if (level === LogLevels.ERROR) {
 *   logger.error("Something went wrong");
 * }
 * ```
 */
export const LogLevels = { NONE, ERROR, WARN, DEBUG, LOG, INFO } as const;

/**
 * Represents all valid log levels for the logger.
 *
 * This type is derived from {@link LOG_LEVELS} and ensures that
 * only one of the predefined strings can be used as a log level.
 *
 * Valid values are:
 * - "none"  – disables all logging
 * - "error" – only logs errors
 * - "warn"  – logs warnings and errors
 * - "debug" – logs debug messages, warnings, and errors
 * - "log"   – logs general messages, debug, warnings, and errors
 * - "info"  – logs informational messages, general logs, debug, warnings, and errors
 *
 * Using this type enforces compile-time safety when specifying a log level.
 *
 * @example
 * let level: LogLevel = "debug"; // ✅ valid
 * let invalidLevel: LogLevel = "verbose"; // ❌ TypeScript error
 */
export type LogLevel = typeof LogLevels[keyof typeof LogLevels];

/**
 * Represents all valid log levels for the logger except "none"
 * 
 * Used internally for methods that must always return a meaningful
 * log level suitable for logging or notice display.
 */
export type ExclusiveLogLevel = Exclude<LogLevel, typeof LogLevels.NONE>;

/**
 * Defines the allowed values for the `level` parameter of the {@link Log.notice} method.
 *
 * This type controls both the logging behavior and the visual appearance
 * of the Notice popup in Obsidian.
 *
 * Allowed values and their effects:
 * - `"error"` → logs as error level, Notice styled as error (red)
 * - `"warn"`  → logs as warn level, Notice styled as warning (yellow)
 * - `"debug"` → logs as debug level, but **no Notice will popup**
 * - `"log"`   → logs as general message, Notice styled as neutral/default
 * - `"info"`  → logs as informational message, Notice styled as info (blue)
 * - `"success"` → logs as debug level, Notice styled as success (green)
 *
 * @remarks
 * Exporting this type ensures TypeScript enforces correct values
 * when calling `Log.notice` from other modules.
 *
 * @internal Test-only export
 */
export type NoticeLevel = ExclusiveLogLevel | typeof SUCCESS;

/**
 * Configuration interface for the logger.
 *
 * Contains the settings that control the behavior of the logger,
 * currently only the log level.
 *
 * IMPORTANT:
 * This object is treated as a **live, mutable configuration**.
 * The logger keeps a reference to it and reacts to runtime changes.
 *
 * Mutating `loglevel` at runtime (e.g. via Obsidian settings)
 * immediately affects logging behavior without reinitialization.
 * 
 * @property loglevel
 *   Specifies the verbosity of the logger. Must be a valid {@link LogLevel}.
 *   Messages with a level less than or equal to this value will be output.
 *
 * @example
 * const settings: LogSettings = { loglevel: "info" };
 */
export interface LogSettings {
  loglevel: LogLevel
}
