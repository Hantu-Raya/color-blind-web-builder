import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";

import { STYLE_FILES } from "../src/colorBlindSchema.js";

const requiredPaths = STYLE_FILES.map((file) => `panorama/styles/base/${file}`);

test("base payload manifest lists synced old_color_blind base styles", async () => {
  const manifestUrl = new URL("../public/payload/color-blind-base/manifest.json", import.meta.url);
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));

  assert.deepEqual(manifest.files, requiredPaths);
  assert.equal(manifest.sourceRepository, "Hantu-Raya/Deadlock-mods-collection");
  assert.equal(manifest.sourceRef, "main");
  assert.equal(manifest.sourcePath, "old_color_blind/panorama/styles/base");
  assert.match(manifest.sourceCommit, /^[0-9a-f]{40}$/);

  await Promise.all(manifest.files.map(async (filePath) => {
    const fileUrl = new URL(`../public/payload/color-blind-base/${filePath}`, import.meta.url);
    const info = await stat(fileUrl);
    assert.ok(info.isFile(), `${filePath} should be a file`);
    assert.ok(info.size > 0, `${filePath} should not be empty`);
  }));
});
