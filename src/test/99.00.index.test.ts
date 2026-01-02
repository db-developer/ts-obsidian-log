// imports LogLevel & LogSettings are (compiletime-) types and 
// cannot be tested at runtime.
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Log } from "../lib";

describe(`Running ${(fileURLToPath(import.meta.url).split(path.sep).join("/").split("/test/")[1] || fileURLToPath(import.meta.url))}`, () => {

  test("export 'Log' is a class (function)", () => {
    expect(Log).toBeDefined();
    expect(typeof Log).toBe("function");
  });

  test("Class Log exposes static init method", () => {
    expect(typeof Log.init).toBe("function");
  });
});
