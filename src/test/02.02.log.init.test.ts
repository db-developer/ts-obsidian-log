import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Purpose of this test suite:
 * - Instantiation exclusively via `Log.init()`
 * - Correct propagation of `pluginName` and `settings`
 * - Fallback behavior for invalid log levels
 * - No tests beyond observable side effects (no logger logic)
 */
describe(`Running ${(fileURLToPath(import.meta.url).split(path.sep).join("/").split("/test/")[1] || fileURLToPath(import.meta.url))}`, () => {

  test("Log.init returns an instance of Log", async () => {
    vi.mock("obsidian", () => {
      return {
        Notice: class {
          messageEl = { addClass: vi.fn() };
          constructor(_message: string) {}
        },
      };
    });
    const { Log } = await import("../lib/log");

    const log = Log.init("test-plugin", { loglevel: "info" });
    expect(log).toBeInstanceOf(Log);
  });

  test("pluginname is correctly used as console prefix", async () => {
    vi.resetModules();

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    vi.mock("obsidian", () => {
      return {
        Notice: class {
          messageEl = { addClass: vi.fn() };
          constructor(_message: string) {}
        },
      };
    });

    const { Log } = await import("../lib/log");

    const log = Log.init("my-plugin", { loglevel: "info" });
    log.info("hello");

    expect(infoSpy).toHaveBeenCalledWith("my-plugin", "hello");

    infoSpy.mockRestore();
  });

  test("settings.loglevel is respected when valid", async () => {
    vi.resetModules();

    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    vi.mock("obsidian", () => {
      return {
        Notice: class {
          messageEl = { addClass: vi.fn() };
          constructor(_message: string) {}
        },
      };
    });

    const { Log } = await import("../lib/log");

    const log = Log.init("test", { loglevel: "debug" });
    log.debug("debug-message");

    expect(debugSpy).toHaveBeenCalled();

    debugSpy.mockRestore();
  });

  test("invalid loglevel falls back to info", async () => {
    vi.resetModules();

    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const infoSpy  = vi.spyOn(console, "info").mockImplementation(() => {});

    vi.mock("obsidian", () => {
      return {
        Notice: class {
          messageEl = { addClass: vi.fn() };
          constructor(_message: string) {}
        },
      };
    });

    const { Log } = await import("../lib/log");

    // bewusst falscher Wert
    const log = Log.init("fallback-test", { loglevel: "INVALID" as any });

    log.debug("should not be logged");
    log.info("should be logged");

    expect(debugSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith("fallback-test", "should be logged");

    debugSpy.mockRestore();
    infoSpy.mockRestore();
  });

});
