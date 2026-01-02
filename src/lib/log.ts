import { Notice             } from "obsidian";
import { DEBUG, 
         ERROR, 
         INFO,
         LOG,
         SUCCESS,
         WARN,
         ExclusiveLogLevel,
         LogLevel,
         LogSettings,
         NoticeLevel        } from "./types"
import { isEnabled,
         getLogLevel,
         resolvePluginName,
         resolveSettings,
         showDebugWarning   } from "./log.internal"

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
export class Log {
  /**
   * Holds the single instance of the {@link Log} class.
   *
   * This implements the singleton pattern: only the first call to {@link Log.init}
   * creates the instance. Subsequent calls return this same object.
   *
   * ⚠️ Important:
   * - The `pluginname` and initial `settings` are set **only once**.
   * - Mutations to `settings` during runtime (e.g., via Obsidian plugin settings)
   *   are still reflected in the singleton instance.
   * - This field is private and should **never be accessed directly**.
   */
  private static singleton: Log;

  /**
   * Tracks whether the initial debug warning has been displayed.
   *
   * This flag ensures that the warning about Chrome DevTools verbosity
   * is logged only once, before the first debug-level message is emitted.
   *
   * @internal
   */
  private static debugWarningShown = false;
  
  /**
   * Creates or returns the singleton {@link Log} instance.
   *
   * This method implements the singleton pattern:
   * - The **first call** to `init()` creates a new `Log` instance using
   *   the provided `pluginname` and `settings`.
   * - **Subsequent calls** return the existing instance; new values for
   *   `pluginname` or `settings` are ignored, though the internal
   *   `loglevel` of the `settings` object may still change at runtime.
   *
   * NOTE:
   * - The `settings` object serves as a vehicle for the desired initial
   *   log level. While `settings` cannot be replaced after initialization,
   *   its `loglevel` property may be mutated during runtime via Obsidian
   *   plugin settings.
   * - The `pluginname` is only applied once and prefixed to all log messages.
   *
   * @param pluginname
   *   A short identifier for the plugin or module using the logger.
   *   Only the first value provided is applied.
   * @param settings
   *   Optional configuration object controlling the logger behavior.
   *   If omitted or invalid, defaults to `{ loglevel: "info" }`.
   * @returns
   *   The singleton {@link Log} instance. Always returns the same object.
   *
   * @example
   * const logger1 = Log.init("MyPlugin", { loglevel: "debug" });
   * const logger2 = Log.init("OtherPlugin", { loglevel: "error" });
   * console.assert(logger1 === logger2); // ✅ true
   */
  public static init(pluginname?: string, settings?: LogSettings) {
    if (! Log.singleton) {
      Log.singleton = new Log(resolvePluginName(pluginname), 
                              resolveSettings(settings));
    }
    return Log.singleton;
  }

  /**
   * Private constructor for the {@link Log} class.
   *
   * Instances should be created via {@link Log.init} to ensure proper
   * runtime validation of settings.
   * 
   * NOTE:
   * The provided `settings` object is a vehicle for the desired
   * type of logging. While settings cannot be "re-set", the internal
   * value of loglevel may be changed by Obsidian/Plugin settings
   * DO NOT clone or freeze settings! Use them as provided.
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
    if (!isEnabled(msglvl, this.settings.loglevel)) {
      return;
    }

    // One-time warning before the very first debug output
    Log.debugWarningShown = showDebugWarning(Log.debugWarningShown, msglvl, this.pluginname);

    CONSOLE_FN[msglvl](this.pluginname, ...args);
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
        case ERROR:   return "notice-error";
        case WARN:    return "notice-warn";
        case INFO:    return "notice-info";
        case SUCCESS: return "notice-success";
        case LOG:     return ""; // neutral / default
        /* c8 ignore next -- defensive default, unreachable via public notice() API */
        default:      return "";
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
    this.logger(DEBUG, ...data);
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
    this.logger(LOG, ...data);
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
    this.logger(INFO, ...data);
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
    this.logger(WARN, ...data);
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
    this.logger(ERROR, ...data, error);
  }

  /**
   * Displays a notice in Obsidian and optionally logs it to the console.
   *
   * This method performs two actions:
   * 1. Logs the message via the internal logger, respecting the current
   *    `LogSettings.loglevel`. The severity is determined using {@link getLogLevel}.
   * 2. Shows a visual Notice popup depending on the specified level.
   *
   * The mapping of `NoticeLevel` to behavior is:
   * - `Error` objects → logged as `"error"`, displayed as an error Notice (red)
   * - `"error"` → logged as `"error"`, displayed as an error Notice (red)
   * - `"warn"` → logged as `"warn"`, displayed as a warning Notice (yellow)
   * - `"success"` → logged as `"debug"`, displayed as a success Notice (green)
   * - `"debug"` → logged as `"debug"`, no Notice popup
   * - `"log"` → logged as `"log"`, displayed as a standard Notice
   * - `"info"` or `undefined` → logged as `"info"`, displayed as an info Notice (blue)
   *
   * @param message - The message to log and/or display in a Notice.
   * @param level - Optional level determining the log severity and Notice styling.
   *                Can be any {@link NoticeLevel} or an `Error` object.
   *
   * @example
   * // Log an informational notice
   * logger.notice("Plugin initialized successfully");
   *
   * // Log a warning notice
   * logger.notice("Configuration value is deprecated", "warn");
   *
   * // Log an error with popup
   * logger.notice("Failed to load configuration", new Error("Missing file"));
   *
   * @remarks
   * - `NoticeLevel "debug"` will never trigger a Notice popup, allowing
   *   debug information to be logged silently.
   * - `NoticeLevel "success"` triggers a Notice and logs to console.debug.
   *
   * @internal
   */
  public notice(message: string, level?: NoticeLevel | Error) {
    // 1. check for loglevel
    const logLevel = getLogLevel(level);

    // 2. Log via logger (only prints if settings allow)
    if (level instanceof Error) {
      this.logger(logLevel, message, level as Error);
    } else {
      this.logger(logLevel, message);
    }

    // 2. Show Notice
    if (level instanceof Error) {
      this.note(`${message}\r\n${level.toString()}`, ERROR);
    } else if ((level === ERROR)   || (level === WARN) || 
               (level === SUCCESS) || (level === LOG))  {
      this.note(message, level);
    } else if (level === DEBUG) {
      // debug does not trigger a notice
      return;
    } else {
      // undefined or info
      this.note(message, INFO);
    }
  }  
}