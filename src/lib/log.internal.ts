import { DEBUG, 
         ERROR, 
         INFO,
         LOG,
         NONE,
         SUCCESS,
         WARN,
         ExclusiveLogLevel,
         LogLevel,
         LogLevels,
         NoticeLevel        } from "./types"

/**
 * A `Set` containing all valid log level strings defined in {@link LogLevels}.
 *
 * This set is used for **fast runtime membership checks** to determine
 * whether a given string is a recognized log level.
 *
 * Typical usage is within the {@link isLogLevel} function:
 * ```ts
 * isLogLevel(value: unknown): value is LogLevel {
 *   return typeof value === "string" && LOG_LEVEL_SET.has(value);
 * }
 * ```
 *
 * Notes:
 * - Unlike arrays, `Set` allows O(1) lookup for large numbers of log levels.
 * - The order of elements in a `Set` is **not guaranteed**, so this is
 *   only intended for membership tests, not for ordering or verbosity comparisons.
 *
 * @internal Test-only export
 */
const LOG_LEVEL_SET = new Set(Object.values(LogLevels));

/**
 * Maps each log level in {@link LogLevels} to a numeric value representing its verbosity.
 *
 * Lower numbers correspond to less verbose levels, and higher numbers correspond
 * to more verbose levels. This mapping allows efficient runtime comparisons
 * to determine whether a message should be logged based on the current logger
 * settings.
 *
 * Example usage:
 * ```ts
 * if (LOG_LEVEL_ORDER[msgLevel] <= LOG_LEVEL_ORDER[currentLevel]) {
 *   // log the message
 * }
 * ```
 *
 * Notes:
 * - The numeric values are assigned in the order of {@link LogLevels}, with
 *   increments of 10:
 *   - NONE  = 0
 *   - ERROR = 10
 *   - WARN  = 20
 *   - DEBUG = 30
 *   - LOG   = 40
 *   - INFO  = 50
 * - The "NONE" level can be used to completely disable logging.
 * - This constant is primarily intended for internal use, e.g., by
 *   {@link isEnabled}, and should not be relied upon externally.
 *
 * @internal Test-only export
 */
const LOG_LEVEL_ORDER: Record<LogLevel, number> = Object.fromEntries(
  Object.values(LogLevels).map((lvl, idx) => [lvl, idx * 10])
) as Record<LogLevel, number>;

/**
 * Determines whether a message with a given log level should be logged
 * based on the currently configured logger level.
 *
 * A message is considered enabled if its level is less than or equal
 * to the configured level in terms of verbosity.
 *
 * @param msglvl
 *   The log level of the message being considered.
 * @param setlvl
 *   The currently configured log level of the logger.
 * @returns
 *   `true` if the message should be logged, `false` otherwise.
 *
 * @example
 * isEnabled("debug", "info"); // true
 * isEnabled("info", "log");   // false
 * 
 * @internal Test-only export
 */
export function isEnabled( msglvl: ExclusiveLogLevel, setlvl: LogLevel): boolean {
  if (setlvl === NONE) return false;
  else return LOG_LEVEL_ORDER[msglvl] <= LOG_LEVEL_ORDER[setlvl];
}

/**
 * Runtime type guard to check whether a value is a valid {@link LogLevel}.
 *
 * This function is useful for validating user-provided or persisted
 * settings at runtime, ensuring that only recognized log levels are used.
 *
 * @param value
 *   The value to check.
 * @returns
 *   `true` if the value is one of the predefined log levels, `false` otherwise.
 *
 * @example
 * isLogLevel("debug"); // true
 * isLogLevel("verbose"); // false
 * 
 * @internal Test-only export
 */
export function isLogLevel(value: unknown): value is LogLevel {
  return typeof value === "string" && LOG_LEVEL_SET.has(value as LogLevel);
}

/**
 * Maps a given `NoticeLevel` to the corresponding `ExclusiveLogLevel` used for logging.
 *
 * This function normalizes the input into an internal log level suitable for
 * the logger. It is used internally by `Log.notice` to determine the severity
 * of console output, independent of whether a Notice popup is displayed.
 *
 * @param level - The input notice level, which can be:
 *   - An `Error` object
 *   - One of the log levels in {@link LogLevels} (excluding `"none"`)
 *   - `"success"`
 *   - `undefined` (treated as `"info"`)
 *
 * @returns The corresponding `ExclusiveLogLevel` that defines the log
 * severity for the message.
 *
 * Mapping rules:
 * - `Error` or `"error"` → `"error"`
 * - `"warn"` → `"warn"`
 * - `"success"` or `"debug"` → `"debug"`
 * - `"log"` → `"log"`
 * - `undefined` or `"info"` → `"info"`
 *
 * Note:
 * - `NoticeLevel "success"` triggers a Notice popup, whereas `NoticeLevel "debug"` does not.
 * - Both `"success"` and `"debug"` are mapped to `ExclusiveLogLevel "debug"` and
 *   may produce `console.debug` output depending on the logger's current settings.
 * 
 * @internal Test-only export
 */
export function getLogLevel(level?: NoticeLevel | Error): ExclusiveLogLevel {
  if (level instanceof Error || level === ERROR) {
    return ERROR;
  } else if (level === SUCCESS || level === DEBUG) {
    // Treat debug AND success, both as debug-level logging
    return DEBUG;
  } else if ((level === WARN) || (level === LOG)) {
    return level;
  } 
  else return INFO // undefined or info will return info
}
