import { Notice } from "obsidian";

/**
 * An array of all valid log levels used by the logger.
 *
 * This array serves as the single source of truth for:
 * - Type definition of {@link LogLevel}
 * - Runtime validation of log level values
 * - Determining the order and verbosity of logs
 *
 * The order of elements defines their relative verbosity:
 * "none" < "error" < "warn" < "debug" < "log" < "info".
 *
 * @example
 * if (LOG_LEVELS.includes(someValue as LogLevel)) {
 *   // someValue is a valid log level
 * }
 */
const LOG_LEVELS = [ "none", "error", "warn", "debug", "log", "info" ] as const;

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
export type LogLevel = typeof LOG_LEVELS[number];

/**
 * Log levels excluding "none".
 * 
 * Used internally for methods that must always return a meaningful
 * log level suitable for logging or notice display.
 */
type ExclusiveLogLevel = Exclude<LogLevel, "none">;

/**
 * A convenience lookup object for all supported log levels.
 *
 * This object maps each log level string to itself, allowing
 * type-safe references throughout the codebase without
 * repeating string literals.
 *
 * Example usage:
 * ```ts
 * if (level === LogLevels.error) {
 *   this.logger(LogLevels.error, message);
 * }
 * ```
 *
 * Benefits:
 * - Eliminates repeated string literals like "error", "warn", "info"
 * - Ensures TypeScript type-safety for all log level comparisons
 * - Works seamlessly with {@link LogLevel} type
 */
const LogLevels = Object.fromEntries(LOG_LEVELS.map(l => [l, l])) as Record<LogLevel, LogLevel>;

/**
 * Defines the allowed values for the `level` parameter of the {@link Log.notice} method.
 *
 * This type controls both the logging behavior and the visual appearance
 * of the Notice popup in Obsidian.
 *
 * - `Error` or `"error"` → logged as error level, Notice styled as error (red)
 * - `"warn"` → logged as warn level, Notice styled as warning (yellow)
 * - `"debug"` or `"success"` → logged as debug level, Notice on "success" styled as success (green)
 * - `"info"` or `undefined` → logged as info level, Notice styled as info (blue)
 *
 * @remarks
 * Exporting this type ensures that TypeScript can enforce correct
 * values when calling `Log.notice` from other modules.
 * 
 * @internal Test-only export
 */
export type NoticeLevel = Error | LogLevel | "success" | undefined;

/**
 * Maps each {@link LogLevel} to a numeric value representing its verbosity.
 *
 * Lower numbers correspond to less verbose levels, and higher numbers
 * correspond to more verbose levels. This mapping is used for runtime
 * comparisons to determine whether a given message should be logged
 * based on the current logger setting.
 *
 * The numeric values are assigned automatically based on the order
 * of {@link LOG_LEVELS}, with increments of 10:
 * - "none"  = 0
 * - "error" = 10
 * - "warn"  = 20
 * - "debug" = 30
 * - "log"   = 40
 * - "info"  = 50
 *
 * Using numeric values allows efficient and simple comparisons:
 * ```
 * if (LOG_LEVEL_ORDER[msgLevel] <= LOG_LEVEL_ORDER[currentLevel]) {
 *   // log the message
 * }
 * ```
 */
const LOG_LEVEL_ORDER: Record<LogLevel, number> = LOG_LEVELS.reduce(
  (acc, level, index) => {
    acc[level] = index * 10; // none=0, error=10, warn=20, ...
    return acc;
  },
  {} as Record<LogLevel, number>
);

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
export function isEnabled( msglvl: LogLevel, setlvl: LogLevel): boolean {
  return LOG_LEVEL_ORDER[msglvl] <= LOG_LEVEL_ORDER[setlvl];
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
  return typeof value === "string" && LOG_LEVELS.includes(value as LogLevel);
}

/**
 * Maps a given `NoticeLevel` to the corresponding `ExclusiveLogLevel` used for logging.
 *
 * @param level - The input notice level, which can be an Error, a LogLevel, "success", or undefined.
 * @returns The `ExclusiveLogLevel` that determines the log severity for the message.
 *
 * - Errors and "error" → "error"
 * - "warn" → "warn"
 * - "success" or "debug" → "debug"
 * - "log" → "log"
 * - undefined or "info" → "info"
 * 
 * @internal Test-only export
 */
export function getLogLevel(level?: NoticeLevel): ExclusiveLogLevel {
  if (level instanceof Error || level === LogLevels.error) {
    return LogLevels.error as ExclusiveLogLevel;
  } else if (level === LogLevels.warn) {
    return LogLevels.warn as ExclusiveLogLevel;
  } else if (level === "success" || level === LogLevels.debug) {
    // Treat debug/success as debug-level logging
    return LogLevels.debug as ExclusiveLogLevel;
  } else if (level === LogLevels.log) {
    return LogLevels.log as ExclusiveLogLevel;
  } 
  else return LogLevels.info as ExclusiveLogLevel // undefined or info
}

/**
 * Configuration interface for the logger.
 *
 * Contains the settings that control the behavior of the logger,
 * currently only the log level.
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

/**
 * Maps each enabled {@link LogLevel} (excluding "none") to the corresponding
 * console method used to output messages.
 *
 * This mapping allows the logger to call the correct console function
 * dynamically based on the message's log level.
 *
 * The "none" level is excluded because it disables all logging.
 *
 * @example
 * CONSOLE_FN["error"]("This is an error message");
 * CONSOLE_FN["info"]("This is an informational message");
 */
const CONSOLE_FN: Record<ExclusiveLogLevel, (...args: unknown[]) => void> = {
  error: console.error,
  warn: console.warn,
  debug: console.debug,
  log: console.log,
  info: console.info,
};

/**
 * Logger class providing structured, level-based logging for plugins or applications.
 *
 * Supports multiple log levels, runtime validation of settings, and
 * safe console output. Each logger instance is tied to a specific
 * plugin or module name, which is prefixed to all log messages.
 *
 * Features:
 * - Log levels: "none", "error", "warn", "debug", "log", "info"
 * - Runtime validation of log level settings
 * - Conditional logging based on configured level
 * - Convenience methods for all standard console methods
 * - Optional integration with UI notices (e.g., Obsidian)
 *
 * @future
 * This class may be extended in the future to support logging to files,
 * allowing log persistence beyond console output.
 *
 * Usage:
 * ```ts
 * const logger = Log.init("MyPlugin", { loglevel: "debug" });
 * logger.info("Plugin initialized");
 * logger.error(new Error("Something went wrong"));
 * ```
 */
export default class Log {
  /**
   * Creates and initializes a new {@link Log} instance.
   *
   * This static method validates the provided {@link LogSettings.loglevel}
   * at runtime. If the provided log level is invalid or missing, it is
   * automatically set to the default level `"info"`.
   *
   * @param pluginname
   *   A short identifier for the plugin or module using the logger.
   *   This string is prefixed to all log messages for context.
   * @param settings
   *   The configuration object controlling the logger behavior.
   *   Only the `loglevel` property is currently used.
   * @returns
   *   A new {@link Log} instance with a guaranteed valid log level.
   *
   * @example
   * const logger = Log.init("MyPlugin", { loglevel: "debug" });
   */
  public static init(pluginname: string, settings: LogSettings) {
    if (!isLogLevel(settings.loglevel)) {
      settings.loglevel = LogLevels.info;
    }
    return new Log(pluginname, settings);
  }

  /**
   * Private constructor for the {@link Log} class.
   *
   * Instances should be created via {@link Log.init} to ensure proper
   * runtime validation of settings.
   *
   * @param pluginname
   *   The name of the plugin or module, used as a prefix for all log messages.
   * @param settings
   *   The validated {@link LogSettings} object controlling log behavior.
   *
   * @remarks
   * The constructor is private to enforce the use of the static `init`
   * method for proper initialization and validation.
   */  
  private constructor(private readonly pluginname: string, private readonly settings: LogSettings) { }

  /**
   * Internal helper method that logs a message to the console if its level
   * is enabled according to the current {@link LogSettings.loglevel}.
   *
   * This method handles the core logic for level-based logging and
   * automatically prefixes messages with the plugin name.
   *
   * @param msglvl
   *   The log level of the message. "none" is excluded since it disables logging.
   * @param args
   *   The message arguments to pass to the console method.
   *
   * @remarks
   * This method should only be called internally by the public logging
   * methods (`debug`, `log`, `info`, `warn`, `error`) to ensure consistent
   * behavior and prefixing.
   *
   * @example
   * this.logger("debug", "Debugging value:", someVariable);
   */
  private logger(
    msglvl: ExclusiveLogLevel,
    ...args: unknown[]
  ) {
    if (isEnabled(msglvl, this.settings.loglevel)) {
      CONSOLE_FN[msglvl](this.pluginname, ...args);
    }
  }

  /**
   * Private helper to show a Notice in Obsidian.
   *
   * @param message - The message text to display.
   * @param level - Determines the CSS class applied for coloring:
   *   - "error" → red
   *   - "warn" → yellow
   *   - "info" → blue
   *   - "log" → neutral / default
   *   - "success" → green
   */
  private note(message: string, level: ExclusiveLogLevel | "success") {
    const n = new Notice(message);

    const cssClass = (() => {
      switch (level) {
        case LogLevels.error: return "notice-error";
        case LogLevels.warn:  return "notice-warn";
        case LogLevels.info:  return "notice-info";
        case "success":       return "notice-success";
        case LogLevels.log:   return ""; // neutral / default
        default: return "";
      }
    })();
    // was: noticeEl (deprecated since 0.9.7) => messageEl
    if (cssClass) n.messageEl.addClass(cssClass);
  }  

  /**
   * Logs a debug-level message to the console.
   *
   * The message will only be output if the current logger's level
   * includes "debug" or a more verbose setting ("log" or "info").
   *
   * @param data
   *   One or more values to log. These are forwarded directly to the
   *   console.debug method, prefixed with the plugin name.
   *
   * @example
   * logger.debug("Current state:", stateObject);
   */
  public debug(...data: unknown[]) {
    this.logger(LogLevels.debug as ExclusiveLogLevel, ...data);
  }

  /**
   * Logs a general message to the console at the "log" level.
   *
   * The message will be output only if the current logger level
   * includes "log" or a more verbose setting ("info").
   *
   * @param data
   *   One or more values to log. These are forwarded directly to the
   *   console.log method, prefixed with the plugin name.
   *
   * @example
   * logger.log("Plugin loaded successfully");
   */
  public log(...data: unknown[]) {
    this.logger(LogLevels.log as ExclusiveLogLevel, ...data);
  }

  /**
   * Logs an informational message to the console at the "info" level.
   *
   * The message will only be output if the current logger level is "info".
   *
   * @param data
   *   One or more values to log. These are forwarded directly to the
   *   console.info method, prefixed with the plugin name.
   *
   * @example
   * logger.info("Initialization complete");
   */
  public info(...data: unknown[]) {
    this.logger(LogLevels.info as ExclusiveLogLevel, ...data);
  }
  
  /**
   * Logs a warning message to the console at the "warn" level.
   *
   * The message will be output if the current logger level is "warn" or more verbose
   * ("debug", "log", or "info").
   *
   * @param data
   *   One or more values to log. These are forwarded directly to the
   *   console.warn method, prefixed with the plugin name.
   *
   * @example
   * logger.warn("Configuration value is deprecated:", deprecatedValue);
   */
  public warn(...data: unknown[]) {
    this.logger(LogLevels.warn as ExclusiveLogLevel, ...data);
  }

  /**
   * Logs an error message to the console at the "error" level.
   *
   * The message will be output if the current logger level is "error" or more verbose
   * ("warn", "debug", "log", or "info"). The method automatically appends
   * the provided Error object to the logged data.
   *
   * @param error
   *   The Error object representing the error to log.
   * @param data
   *   Optional additional values to include in the log output.
   *
   * @example
   * try {
   *   someFunction();
   * } catch (e) {
   *   logger.error(e, "Failed to execute someFunction");
   * }
   */
  public error( error: Error, ...data: unknown[] ) {
    this.logger(LogLevels.error as ExclusiveLogLevel, ...data, error);
    console.log
  }

  /**
   * Displays a notice and optionally logs it according to the specified level.
   *
   * This method performs two main actions:
   * 1. Logs the message via the internal logger. The log will only be printed
   *    if the current settings allow the specified log level.
   * 2. Shows a visual notice to the user. The notice behavior depends on the level:
   *    - Error objects are always logged and displayed as error notices.
   *    - "success" messages are displayed as success notices.
   *    - "debug" messages are logged but do not trigger a notice.
   *    - "log" messages are displayed as standard log notices.
   *    - undefined or "info" messages are displayed as informational notices.
   *
   * @param {string} message - The message to log and/or display.
   * @param {NoticeLevel | Error} [level] - Optional log/notice level or an Error object.
   *                                         Determines how the message is logged and displayed.
   *
   * @example
   * // Log a notice
   * logger.notice("Plugin initialized successfully");
   *
   * // Log an error notice
   * logger.notice("Failed to load configuration", new Error("Missing file"));
   * logger.notice("Failed to load configuration", "error");
   */
  public notice(message: string, level?: NoticeLevel) {
    // 1. check for loglevel
    const logLevel = getLogLevel(level);

    // 2. Log via logger (only prints if settings allow)
    if (level instanceof Error) {
      this.logger(logLevel, message, level as Error);
    } else {
      this.logger(logLevel, message);
    }

    // 2. Show Notice (always pops up)
    if (level instanceof Error) {
      this.note(`${message}\r\n${level.toString()}`, LogLevels.error as ExclusiveLogLevel);
    } else if (level === LogLevels.warn) {
      this.note(message, LogLevels.warn as ExclusiveLogLevel);
    } else if (level === "success") {
      this.note(message, "success");
    } else if (level === LogLevels.debug) {
      // debug does not trigger a notice
      return;
    } else if (level === LogLevels.log) {
      this.note(message, LogLevels.log as ExclusiveLogLevel);
    } else {
      // undefined or info
      this.note(message, LogLevels.info as ExclusiveLogLevel);
    }
  }  
}