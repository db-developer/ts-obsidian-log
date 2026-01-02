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
         LogSettings,
         NoticeLevel        } from "./types"

/**
 * Build-time injected plugin identifier.
 *
 * This constant is expected to be **statically replaced at bundle time**
 * by the build tool (e.g. Rollup) and is **not** resolved at runtime.
 *
 * Typical Rollup configuration:
 *
 * ```ts
 * import replace from "@rollup/plugin-replace";
 *
 * replace({
 *   preventAssignment: true,
 *   values: {
 *     __PLUGIN_NAME__: JSON.stringify("my-plugin"),
 *   },
 * })
 * ```
 *
 * Notes:
 * - This value is optional and may be `undefined` if not injected.
 * - No runtime file system access or dynamic imports are involved.
 * - This approach is safe for Obsidian plugins and ESM/CJS bundles.
 *
 * @internal Build-time constant
 */
declare const __PLUGIN_NAME__: string | undefined;

/**
 * Resolves the effective plugin name used for logging and diagnostics.
 *
 * Resolution order:
 * 1. Explicitly provided `name` argument
 * 2. Build-time injected {@link __PLUGIN_NAME__}
 * 3. Fallback literal `"unknown-plugin"`
 *
 * This function is intentionally **pure and synchronous**:
 * - no file system access
 * - no dynamic imports
 * - no dependency on Node.js APIs
 *
 * This makes it safe to use in:
 * - Obsidian plugin runtime
 * - unit tests
 * - bundled ESM or CJS output
 *
 * @param name
 *   Optional explicit plugin name.
 *   When provided, it always takes precedence.
 *
 * @returns
 *   The resolved plugin name.
 */
export function resolvePluginName(pluginname?: string): string {
  if (pluginname) return pluginname;

  if (typeof __PLUGIN_NAME__ !== "undefined") {
    return __PLUGIN_NAME__;
  }

  return "unknown-plugin";
}

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

/**
 * Resolves and normalizes logger settings.
 *
 * Behavior:
 * - If no settings are provided, a new settings object with default values
 *   is created.
 * - If settings are provided but contain an invalid loglevel, the loglevel
 *   is mutated to the default value.
 *
 * Note:
 * The settings object is intentionally mutable. This allows external
 * configuration (e.g. Obsidian plugin settings) to change the effective
 * log level at runtime.
 *
 * @param settings
 *   Optional logger settings provided by the caller.
 * @returns
 *   A guaranteed valid {@link LogSettings} object.
 */
export function resolveSettings(settings?: LogSettings): LogSettings {
  if (!settings) {
    return { loglevel: INFO };
  }

  if (!isLogLevel(settings.loglevel)) {
    settings.loglevel = INFO;
  }

  return settings;
}

/**
 * Warning message displayed the first time a debug-level log is invoked.
 *
 * Browsers like Chrome only show `console.debug` output if DevTools
 * are set to "Verbose" or an equivalent detailed level.
 *
 * This constant is used by `showDebugWarnung()` to notify developers
 * that debug output may not be visible by default.
 */
const DEBUGWARNING = "Debug output may not be visible unless Chrome DevTools are set to 'Verbose'." as const;

/**
 * Conditionally displays a one-time debug warning to the console.
 *
 * This function is intended to alert the developer that debug messages
 * may not appear unless the browser's DevTools are set to a verbose level.
 * It only triggers for the first debug-level message.
 *
 * @param show
 *   Boolean flag indicating whether the debug warning has already been shown.
 *   If `false`, the warning is displayed; otherwise, no output occurs.
 * @param msglvl
 *   The log level of the current message. The warning is only shown
 *   when this equals {@link DEBUG}.
 * @param pluginname
 *   The name of the plugin or module, used as a prefix in the console warning.
 *
 * @returns
 *   Returns `false` if the warning was shown (indicating it should no longer
 *   be shown), otherwise returns the original `show` value.
 *
 * @example
 * let debugWarningShown = true;
 * debugWarningShown = showDebugWarnung(debugWarningShown, DEBUG, "MyPlugin");
 */
export function showDebugWarning(show: boolean, msglvl: LogLevel, pluginname: string): boolean {
  if (!show) return show;
  if (msglvl !== DEBUG) return show;

  console.warn(pluginname, DEBUGWARNING);
  
  return false;
}