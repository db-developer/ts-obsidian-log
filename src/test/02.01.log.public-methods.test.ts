describe("Running 02.01.log.public-methods.test.ts", () => {

  test("debug() logs via console.debug when loglevel allows it", async () => {
    vi.resetModules();

    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: class {
        messageEl = { addClass: vi.fn() };
        constructor(_message: string) {}
      },
    }));

    const { default: Log } = await import("../lib/log");

    const log = Log.init("plugin", { loglevel: "debug" });
    log.debug("dbg");

    expect(debugSpy).toHaveBeenCalledWith("plugin", "dbg");

    debugSpy.mockRestore();
  });

  test("debug() logs when loglevel is higher (info)", async () => {
    vi.resetModules();

    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: class {
        messageEl = { addClass: vi.fn() };
        constructor(_message: string) {}
      },
    }));

    const { default: Log } = await import("../lib/log");

    const log = Log.init("plugin", { loglevel: "info" });
    log.debug("dbg");

    expect(debugSpy).toHaveBeenCalled();

    debugSpy.mockRestore();
  });

  test("debug() does not log when loglevel is lower (warn)", async () => {
    vi.resetModules();

    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: class {
        messageEl = { addClass: vi.fn() };
        constructor(_message: string) {}
      },
    }));

    const { default: Log } = await import("../lib/log");

    const log = Log.init("plugin", { loglevel: "warn" });
    log.debug("dbg");

    expect(debugSpy).not.toHaveBeenCalled();

    debugSpy.mockRestore();
  });

  test("info() logs via console.info", async () => {
    vi.resetModules();

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: class {
        messageEl = { addClass: vi.fn() };
        constructor(_message: string) {}
      },
    }));

    const { default: Log } = await import("../lib/log");

    const log = Log.init("plugin", { loglevel: "info" });
    log.info("hello");

    expect(infoSpy).toHaveBeenCalledWith("plugin", "hello");

    infoSpy.mockRestore();
  });

  test("warn() logs via console.warn", async () => {
    vi.resetModules();

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: class {
        messageEl = { addClass: vi.fn() };
        constructor(_message: string) {}
      },
    }));

    const { default: Log } = await import("../lib/log");

    const log = Log.init("plugin", { loglevel: "warn" });
    log.warn("warn");

    expect(warnSpy).toHaveBeenCalledWith("plugin", "warn");

    warnSpy.mockRestore();
  });

  test("log() logs via console.log", async () => {
    vi.resetModules();

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: class {
        messageEl = { addClass: vi.fn() };
        constructor(_message: string) {}
      },
    }));

    const { default: Log } = await import("../lib/log");

    const log = Log.init("plugin", { loglevel: "log" });
    log.log("plain");

    expect(logSpy).toHaveBeenCalledWith("plugin", "plain");

    logSpy.mockRestore();
  });

  test("error() logs via console.error and appends Error", async () => {
    vi.resetModules();

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: class {
        messageEl = { addClass: vi.fn() };
        constructor(_message: string) {}
      },
    }));

    const { default: Log } = await import("../lib/log");

    const err = new Error("boom");
    const log = Log.init("plugin", { loglevel: "error" });

    log.error(err, "failed");

    expect(errorSpy).toHaveBeenCalledWith("plugin", "failed", err);

    errorSpy.mockRestore();
  });

});
