describe("Running 03.01.log.notice.test.ts", () => {

  test("notice() with undefined level logs info and shows info notice", async () => {
    vi.resetModules();

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: vi.fn(function (message: string) {
        this.messageEl = { addClass: vi.fn() };
      }),
    }));

    const { default: Log } = await import("../lib/log");
    const { Notice } = await import("obsidian");
    (Notice as any).mockClear();

    const log = Log.init("plugin", { loglevel: "info" });
    log.notice("hello");

    expect(infoSpy).toHaveBeenCalledWith("plugin", "hello");

    const noticeInstance = (Notice as any).mock.instances.at(-1);
    expect(noticeInstance.messageEl.addClass)
      .toHaveBeenCalledWith("notice-info");

    infoSpy.mockRestore();
  });

  test("notice() with Error logs error and shows error notice with stack", async () => {
    vi.resetModules();

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: vi.fn(function (message: string) {
        this.messageEl = { addClass: vi.fn() };
      }),
    }));

    const { default: Log } = await import("../lib/log");
    const { Notice } = await import("obsidian");
    (Notice as any).mockClear();

    const err = new Error("boom");
    const log = Log.init("plugin", { loglevel: "error" });

    log.notice("failed", err);

    expect(errorSpy).toHaveBeenCalledWith("plugin", "failed", err);

    const noticeInstance = (Notice as any).mock.instances.at(-1);
    expect(noticeInstance.messageEl.addClass)
      .toHaveBeenCalledWith("notice-error");

    errorSpy.mockRestore();
  });

  test('notice() with "success" shows success notice and logs as debug', async () => {
    vi.resetModules();

    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: vi.fn(function (message: string) {
        this.messageEl = { addClass: vi.fn() };
      }),
    }));

    const { default: Log } = await import("../lib/log");
    const { Notice } = await import("obsidian");
    (Notice as any).mockClear();

    const log = Log.init("plugin", { loglevel: "debug" });
    log.notice("ok", "success");

    expect(debugSpy).toHaveBeenCalledWith("plugin", "ok");

    const noticeInstance = (Notice as any).mock.instances.at(-1);
    expect(noticeInstance.messageEl.addClass)
      .toHaveBeenCalledWith("notice-success");

    debugSpy.mockRestore();
  });

  test("notice() with debug does log but does not show a notice", async () => {
    vi.resetModules();

    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: vi.fn(function (message: string) {
        this.messageEl = { addClass: vi.fn() };
      }),
    }));

    const { default: Log } = await import("../lib/log");
    const { Notice } = await import("obsidian");
    (Notice as any).mockClear();

    const log = Log.init("plugin", { loglevel: "debug" });
    log.notice("dbg", "debug");

    expect(debugSpy).toHaveBeenCalledWith("plugin", "dbg");

    // Prüfen, dass keine Notice eine Klasse hinzugefügt hat
    const noticeInstances = (Notice as any).mock.instances;
    for (const inst of noticeInstances) {
      expect(inst.messageEl.addClass).not.toHaveBeenCalled();
    }

    debugSpy.mockRestore();
  });

  test("notice() with log level shows neutral notice", async () => {
    vi.resetModules();

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: vi.fn(function (message: string) {
        this.messageEl = { addClass: vi.fn() };
      }),
    }));

    const { default: Log } = await import("../lib/log");
    const { Notice } = await import("obsidian");
    (Notice as any).mockClear();

    const log = Log.init("plugin", { loglevel: "log" });
    log.notice("plain", "log");

    expect(logSpy).toHaveBeenCalledWith("plugin", "plain");

    const noticeInstance = (Notice as any).mock.instances.at(-1);
    expect(noticeInstance.messageEl.addClass).not.toHaveBeenCalled();

    logSpy.mockRestore();
  });

  test("notice() with warn level shows warning notice", async () => {
    vi.resetModules();

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: vi.fn(function (message: string) {
        this.messageEl = { addClass: vi.fn() };
      }),
    }));

    const { default: Log } = await import("../lib/log");
    const { Notice } = await import("obsidian");
    (Notice as any).mockClear();

    const log = Log.init("plugin", { loglevel: "info" });
    log.notice("be careful", "warn");

    expect(warnSpy).toHaveBeenCalledWith("plugin", "be careful");

    const noticeInstance = (Notice as any).mock.instances.at(-1);
    expect(noticeInstance.messageEl.addClass).toHaveBeenCalledWith("notice-warn");

    warnSpy.mockRestore();
  });

  test("notice() with unknown level uses default and shows info notice", async () => {
    vi.resetModules();

    const logSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    vi.mock("obsidian", () => ({
      Notice: vi.fn(function (message: string) {
        this.messageEl = { addClass: vi.fn() };
      }),
    }));

    const { default: Log } = await import("../lib/log");
    const { Notice } = await import("obsidian");
    (Notice as any).mockClear();

    const log = Log.init("plugin", { loglevel: "info" });
    // level ist absichtlich falsch / undefiniert
    log.notice("default case test", "unknown" as any);

    expect(logSpy).toHaveBeenCalledWith("plugin", "default case test");

    const noticeInstance = (Notice as any).mock.instances.at(-1);
    expect(noticeInstance.messageEl.addClass).toHaveBeenCalled();

    logSpy.mockRestore();
  });

});
