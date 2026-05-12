import assert from "node:assert/strict";
import { test } from "node:test";
import { COLOR_ROLES, STYLE_FILES } from "../src/colorBlindSchema.js";
import {
  buildColorBlindPackage,
  buildCombinedCss,
  buildCssByFile,
  createDefaultBuilderState,
  formatPanoramaColor,
  sanitizeBuilderState
} from "../src/packageBuilder.js";
import { crc32 } from "../src/crc32.js";
import { writeVpk } from "../src/vpkWriter.js";

test("formats Source 2 hex alpha values", () => {
  assert.equal(formatPanoramaColor("#f0e442", 100), "#F0E442");
  assert.equal(formatPanoramaColor("#f0e442", 50), "#F0E44280");
  assert.equal(formatPanoramaColor("bad", 25), "#FFFFFF40");
});

test("sanitizes colors and wash values", () => {
  const state = sanitizeBuilderState({
    name: "Test",
    globalWash: 220,
    backgroundWash: -5,
    roles: {
      enemy: { color: "not-a-color", wash: 999 },
      friend: { color: "#123abc", wash: -2 }
    }
  });

  assert.equal(state.globalWash, 100);
  assert.equal(state.backgroundWash, 0);
  assert.equal(state.roles.enemy.color, "#F0E442");
  assert.equal(state.roles.enemy.wash, 100);
  assert.equal(state.roles.friend.color, "#123ABC");
  assert.equal(state.roles.friend.wash, 0);
});

test("builds CSS for every old_color_blind override file", () => {
  const state = createDefaultBuilderState();
  const cssByFile = buildCssByFile(state);

  assert.deepEqual(Object.keys(cssByFile), STYLE_FILES);
  assert.match(cssByFile["unit_status.css"], /@import url\("s2r:\/\/panorama\/styles\/base\/unit_status\.vcss_c"\);/);
  assert.doesNotMatch(cssByFile["unit_status.css"], /Source target:/);
  assert.match(cssByFile["unit_status.css"], /\.enemy #unit_healthbar_lagging/);
  assert.match(cssByFile["hud_ability_icon.css"], /\.active \.ability_bg/);
  assert.match(cssByFile["citadel_hud_top_bar.css"], /CitadelHeroBadge\.TopBar \.BadgeBackground/);
  assert.match(cssByFile["citadel_hud_top_bar.css"], /CitadelHudTopBarPlayer\.SpectatorTarget/);
  assert.match(cssByFile["citadel_hud_top_bar.css"], /HeroContentsCoinBackground/);
  assert.doesNotMatch(cssByFile["citadel_hud_top_bar.css"], /CitadelHudTopBarPlayer\.SpectatorTarget,/);
  assert.doesNotMatch(cssByFile["citadel_hud_top_bar.css"], /#HeroIcon/);
});

test("custom colors flow into generated CSS", () => {
  const state = createDefaultBuilderState();
  state.roles.enemy.color = "#ABCDEF";
  state.roles.enemy.wash = 50;
  state.globalWash = 80;

  const css = buildCssByFile(state)["unit_status.css"];
  assert.match(css, /wash-color: #ABCDEF66;/);
});

test("shop item labels keep readable contrast after color wash", () => {
  const css = buildCssByFile(createDefaultBuilderState())["citadel_shop_mod_view.css"];

  assert.match(css, /#CitadelHudHeroShop CitadelShopMod \.modName/);
  assert.match(css, /#CitadelHudHeroShop CitadelShopMod \.ItemName/);
  assert.match(css, /color: #F8FAFC;/);
  assert.match(css, /text-shadow: 0px 0px 5\.0 #000000;/);
  assert.match(css, /#CitadelHudHeroShop CitadelShopMod #mod_tier_label/);
  assert.match(css, /wash-color: #F8FAFC;/);
});

test("builds compiled resources and VPK bytes", () => {
  const state = createDefaultBuilderState();
  const result = buildColorBlindPackage(state);
  const vpk = writeVpk(result.files);

  assert.equal(result.files.length, STYLE_FILES.length);
  assert.ok(result.files.some((file) => file.path === "panorama/styles/unit_status.vcss_c"));
  assert.equal(vpk[0], 0x34);
  assert.equal(vpk[1], 0x12);
  assert.equal(vpk[2], 0xaa);
  assert.equal(vpk[3], 0x55);
});

test("includes synced base style resources when provided", () => {
  const state = createDefaultBuilderState();
  const baseCssByFile = Object.fromEntries(STYLE_FILES.map((file) => [file, `/* base ${file} */\n`]));
  const result = buildColorBlindPackage(state, { baseCssByFile });

  assert.equal(result.baseFileCount, STYLE_FILES.length);
  assert.equal(result.files.length, STYLE_FILES.length * 2);
  assert.ok(result.files.some((file) => file.path === "panorama/styles/base/unit_status.vcss_c"));
  assert.ok(result.files.some((file) => file.path === "panorama/styles/unit_status.vcss_c"));
});

test("compiled style DATA block uses Panorama payload header", () => {
  const state = createDefaultBuilderState();
  const { files, cssByFile } = buildColorBlindPackage(state);
  const file = files.find((item) => item.path === "panorama/styles/hud_ability_icon.vcss_c");
  assert.ok(file);

  const view = new DataView(file.bytes.buffer, file.bytes.byteOffset, file.bytes.byteLength);
  const blockOffset = view.getUint32(8, true);
  const blockTableOffset = 8 + blockOffset;
  const dataBlockOffset = blockTableOffset + 4 + view.getUint32(blockTableOffset + 4, true);
  const dataBlockSize = view.getUint32(blockTableOffset + 8, true);
  const cssBytes = new TextEncoder().encode(cssByFile["hud_ability_icon.css"]);

  assert.equal(view.getUint32(blockTableOffset, true), 0x41544144);
  assert.equal(dataBlockSize, cssBytes.byteLength + 6);
  assert.equal(view.getUint32(dataBlockOffset, true), crc32(cssBytes));
  assert.equal(view.getUint16(dataBlockOffset + 4, true), 0);
  assert.equal(new TextDecoder().decode(file.bytes.slice(dataBlockOffset + 6)), cssByFile["hud_ability_icon.css"]);
});

test("role schema maps a broad set of targets", () => {
  const totalTargets = COLOR_ROLES.reduce((sum, role) => sum + role.targets.length, 0);
  const combined = buildCombinedCss(createDefaultBuilderState());

  assert.ok(totalTargets >= 120);
  assert.match(combined, /citadel_shop_mod_view\.css/);
  assert.match(combined, /ability_hud_elements\/element_sprint\.css/);
});
