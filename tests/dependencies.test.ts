import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { test } from "node:test";

const require = createRequire(resolve("package.json"));

test("xcode conserva su API CommonJS y UUID v4 con la dependencia corregida", () => {
  const xcodeRequire = createRequire(require.resolve("xcode"));
  const uuid = xcodeRequire("uuid");
  assert.equal(xcodeRequire("uuid/package.json").version, "11.1.1");
  assert.equal(typeof uuid.v4, "function");
  assert.match(uuid.v4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  const project = require("xcode").project("fixture-no-se-lee-del-disco.pbxproj");
  project.hash = { project: { objects: {} } };
  const ids = new Set(Array.from({ length: 100 }, () => project.generateUuid()));
  assert.equal(ids.size, 100);
  for (const id of ids) assert.match(String(id), /^[A-F0-9]{24}$/);
});
