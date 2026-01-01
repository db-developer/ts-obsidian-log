// imports LogLevel & LogSettings are (compiletime-) types and 
// cannot be tested at runtime.
import { Log } from "../lib";

describe("Running 99.00.index.test.ts", () => {

  test("export 'Log' is a class (function)", () => {
    expect(Log).toBeDefined();
    expect(typeof Log).toBe("function");
  });

  test("Class Log exposes static init method", () => {
    expect(typeof Log.init).toBe("function");
  });
});
