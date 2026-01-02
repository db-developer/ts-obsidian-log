import { fileURLToPath } from "node:url";
import path from "node:path";

vi.resetModules()

const infoSpy  = vi.spyOn(console, "info" ).mockImplementation(() => {});
const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

// Mocks vor dem Import
vi.mock("obsidian", () => {
  return {
    Notice: class {
      messageEl = { addClass: vi.fn() };
      constructor(_message: string) {}
    },
  };
});

// Dynamischer import nach Mocks!
const { Log } = await import("../lib/log");
import type { LogSettings } from "../lib/types";

describe(`Running ${(fileURLToPath(import.meta.url).split(path.sep).join("/").split("/test/")[1] || fileURLToPath(import.meta.url))}`, () => {
  afterAll(() => {
    infoSpy.mockRestore();
    debugSpy.mockRestore();
  });

  // Initiale Singleton-Instanz (wird für alle Tests verwendet)
  const settings   = { loglevel: "log" };
  const initialLog = Log.init("plugin-A", settings as LogSettings);

  test("Log.init returns the same singleton instance", () => {
    const secondLog = Log.init("plugin-B", { loglevel: "debug" });
    expect(secondLog).toBe(initialLog);
  });

  test("pluginname is taken from first init", () => {
    const log = Log.init("ignored-pluginname", { loglevel: "info" });
    log.debug("hello");

    // pluginname stammt aus der initialen Instanz
    expect(debugSpy).toHaveBeenCalledWith("plugin-A", "hello");

    debugSpy.mockRestore();
  });

  test("loglevel controls which messages are emitted", () => {
    const log = Log.init("level-test", { loglevel: "info" }); // wird ignoriert, Singleton bereits init

    // Singleton existiert bereits → loglevel bleibt 'log' aus erstem Init
    log.debug("debug-msg"); // unter log → erlaubt
    expect(debugSpy).toHaveBeenCalledWith("plugin-A", "debug-msg");

    log.info("info-msg");  // über log → nicht erlaubt
    expect(infoSpy).not.toHaveBeenCalled();

    debugSpy.mockRestore();
    infoSpy.mockRestore();
  });

  test("invalid loglevel on subsequent init does not change singleton", () => {
    const log = Log.init("fallback-test", { loglevel: "INVALID" as any });

    // Singleton existiert bereits → loglevel bleibt 'log' aus erstem Init
    log.debug("other-debug-msg"); // unter log → erlaubt
    expect(debugSpy).toHaveBeenCalledWith("plugin-A", "other-debug-msg");

    log.info("other-info-msg");   // über log → nicht erlaubt
    expect(infoSpy).not.toHaveBeenCalled();

    debugSpy.mockRestore();
    infoSpy.mockRestore();
  });

  test("settings.loglevel can be mutated at runtime (increased)", () => {
    const log = initialLog;

    // debug unter log → wird geloggt
    log.debug("yet-a-debug");
    expect(debugSpy).toHaveBeenCalledWith("plugin-A", "yet-a-debug");

    // info über log → wird nicht geloggt
    log.info("yet-an-info");
    expect(infoSpy).not.toHaveBeenCalled();

    debugSpy.mockRestore();
    infoSpy.mockRestore();

    // mutate loglevel auf info
    // settings.loglevel = "info"
    log["settings"].loglevel = "info";

    // debug unter log → wird geloggt
    log.debug("yet-a-second-debug");
    expect(debugSpy).toHaveBeenCalledWith("plugin-A", "yet-a-second-debug");

    // info über log → wird nicht geloggt
    log.info("yet-a-second-info");
    expect(infoSpy).toHaveBeenCalledWith("plugin-A", "yet-a-second-info");

    debugSpy.mockRestore();
    infoSpy.mockRestore();
  });
});
