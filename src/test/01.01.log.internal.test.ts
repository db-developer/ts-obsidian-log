// mocks
vi.mock("obsidian", () => {
  return {
    Notice: class {
      messageEl = {
        addClass: vi.fn(),
      };
      constructor(_message: string) {}
    },
  };
});

// imports
import { fileURLToPath } from "node:url";
import path from "node:path";
import { isEnabled, isLogLevel, getLogLevel } from "../lib/log.internal";

describe(`Running ${(fileURLToPath(import.meta.url).split(path.sep).join("/").split("/test/")[1] || fileURLToPath(import.meta.url))}`, () => {

  test("isEnabled is exported and callable", () => {
    expect(typeof isEnabled).toBe("function");
  });

  test("isLogLevel is exported and callable", () => {
    expect(typeof isLogLevel).toBe("function");
  });

  test("getLogLevel is exported and callable", () => {
    expect(typeof getLogLevel).toBe("function");
  });

  describe("isEnabled()", () => {

    test("returns true when message level is equal to setting level", () => {
      expect(isEnabled("info", "info")).toBe(true);
    });

    test("returns true when message level is more severe than setting level", () => {
      expect(isEnabled("error", "warn")).toBe(true);
      expect(isEnabled("warn", "info")).toBe(true);
    });

    test("returns false when message level is less severe than setting level", () => {
      expect(isEnabled("debug", "warn")).toBe(false);
      expect(isEnabled("info", "error")).toBe(false);
    });

    test("none must allow nothing", () => {
      expect(isEnabled("none", "none")).toBe(false);
      expect(isEnabled("error", "none")).toBe(false);
    });

  });

  describe("isLogLevel()", () => {

    test("returns true for all valid log levels", () => {
      expect(isLogLevel("none")).toBe(true);
      expect(isLogLevel("error")).toBe(true);
      expect(isLogLevel("warn")).toBe(true);
      expect(isLogLevel("debug")).toBe(true);
      expect(isLogLevel("log")).toBe(true);
      expect(isLogLevel("info")).toBe(true);
    });

    test("returns false for invalid strings", () => {
      expect(isLogLevel("INVALID")).toBe(false);
      expect(isLogLevel("Error")).toBe(false);
      expect(isLogLevel("")).toBe(false);
    });

    test("returns false for non-string values", () => {
      expect(isLogLevel(undefined)).toBe(false);
      expect(isLogLevel(null)).toBe(false);
      expect(isLogLevel(123)).toBe(false);
      expect(isLogLevel({})).toBe(false);
      expect(isLogLevel([])).toBe(false);
    });

  });

  describe("getLogLevel()", () => {
    test("returns 'error' for an Error instance", () => {
      const err = new Error("boom");
      expect(getLogLevel(err)).toBe("error");
    });

    test("returns 'error' for LogLevels.error string", () => {
      expect(getLogLevel("error")).toBe("error");
    });

    test("returns 'warn' for LogLevels.warn string", () => {
      expect(getLogLevel("warn")).toBe("warn");
    });

    test("returns 'debug' for 'success' string", () => {
      expect(getLogLevel("success")).toBe("debug");
    });

    test("returns 'debug' for LogLevels.debug string", () => {
      expect(getLogLevel("debug")).toBe("debug");
    });

    test("returns 'log' for LogLevels.log string", () => {
      expect(getLogLevel("log")).toBe("log");
    });

    test("returns 'info' for LogLevels.info string", () => {
      expect(getLogLevel("info")).toBe("info");
    });

    test("returns 'info' for undefined input", () => {
      expect(getLogLevel(undefined)).toBe("info");
    });

    test("returns 'info' for any input", () => {
      expect(getLogLevel([])).toBe("info");
    });

    test("returns 'info' for empty string input", () => {
      expect(getLogLevel("")).toBe("info");
    });

  });
});
