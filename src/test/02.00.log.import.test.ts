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
import { Log } from "../lib/log";

/**
 * Purpose of this test suite:
 * - The module can be imported without runtime errors
 * - The default export class `Log` is present
 * - The class exposes the expected public API
 * - Type exports are considered indirectly (not verifiable at runtime)
 * - The exported functions are present
 * - No logic tests; import and existence checks only
 */
describe(`Running ${(fileURLToPath(import.meta.url).split(path.sep).join("/").split("/test/")[1] || fileURLToPath(import.meta.url))}`, () => {

  test("module can be imported without throwing", () => {
    expect(Log).toBeDefined();
  });

  test("default export is a class (function)", () => {
    expect(typeof Log).toBe("function");
  });

  test("Log exposes static init method", () => {
    expect(typeof Log.init).toBe("function");
  });

  test("Log prototype exposes public logging methods", () => {
    const proto = Log.prototype;

    expect(typeof proto.debug).toBe("function");
    expect(typeof proto.log).toBe("function");
    expect(typeof proto.info).toBe("function");
    expect(typeof proto.warn).toBe("function");
    expect(typeof proto.error).toBe("function");
    expect(typeof proto.notice).toBe("function");
  });
});
