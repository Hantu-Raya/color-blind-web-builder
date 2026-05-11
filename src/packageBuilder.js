import { COLOR_ROLES, EFFECT_TARGETS, PRESETS, STYLE_FILES, getDefaultRoleValues } from "./colorBlindSchema.js";
import { compileTextResource } from "./source2ResourceWriter.js";

const COLOR_RE = /^#[0-9a-f]{6}$/i;

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.min(max, Math.max(min, numeric));
}

function normalizeHex(value, fallback) {
  const text = String(value || "").trim();
  return COLOR_RE.test(text) ? text.toUpperCase() : fallback;
}

function alphaToHex(percent) {
  const value = Math.round((clamp(percent, 0, 100) / 100) * 255);
  return value.toString(16).padStart(2, "0").toUpperCase();
}

export function formatPanoramaColor(hex, alphaPercent = 100) {
  const clean = normalizeHex(hex, "#FFFFFF");
  const alpha = clamp(alphaPercent, 0, 100);
  return alpha >= 99.5 ? clean : `${clean}${alphaToHex(alpha)}`;
}

function baseImportForFile(file) {
  const compiledPath = file.replace(/\.css$/i, ".vcss_c");
  return `@import url("s2r://panorama/styles/base/${compiledPath}");`;
}

function outputPathForFile(file) {
  return `panorama/styles/${file.replace(/\.css$/i, ".vcss_c")}`;
}

function outputBasePathForFile(file) {
  return `panorama/styles/base/${file.replace(/\.css$/i, ".vcss_c")}`;
}

function normalizeBaseFilePath(file) {
  const clean = String(file || "").replaceAll("\\", "/").replace(/^\/+/, "");
  return clean.startsWith("panorama/styles/base/")
    ? clean.slice("panorama/styles/base/".length)
    : clean;
}

function buildBaseFiles(baseCssByFile = {}) {
  return Object.entries(baseCssByFile)
    .map(([file, css]) => {
      const normalizedFile = normalizeBaseFilePath(file);
      if (!normalizedFile || normalizedFile.includes("../") || normalizedFile.startsWith("..") || !normalizedFile.endsWith(".css")) {
        throw new Error(`Invalid base style file path: ${file}`);
      }
      return {
        path: outputBasePathForFile(normalizedFile),
        bytes: compileTextResource(String(css || ""))
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

function selectorKey(file, selector) {
  return `${file}\n${selector}`;
}

function declarationValue(target, roleState, settings) {
  if (target.fixedValue !== undefined) return String(target.fixedValue);

  const baseAlpha = clamp(target.alpha ?? 100, 0, 100);
  const roleWash = clamp(roleState.wash, 0, 100);
  const globalWash = target.prop === "background-color"
    ? clamp(settings.backgroundWash, 0, 100)
    : clamp(settings.globalWash, 0, 100);
  const alpha = (baseAlpha * roleWash * globalWash) / 10000;

  if (target.format === "gradient") {
    const from = formatPanoramaColor(roleState.color, Math.min(100, alpha + 12));
    return `gradient( linear, 0% 0%, 100% 100%, from( ${from} ), to( #F3F0E74d ) )`;
  }

  if (target.prop === "color") {
    return formatPanoramaColor(roleState.color, Math.max(92, alpha));
  }

  return formatPanoramaColor(roleState.color, alpha);
}

function createPresetState(presetId = "legacy-okabe") {
  const defaults = getDefaultRoleValues();
  const preset = PRESETS.find((item) => item.id === presetId) || PRESETS[0];
  const roles = { ...defaults };
  for (const [roleId, color] of Object.entries(preset.colors || {})) {
    if (roles[roleId]) roles[roleId] = { ...roles[roleId], color };
  }
  return {
    name: preset.label,
    presetId: preset.id,
    globalWash: preset.globalWash,
    backgroundWash: preset.backgroundWash,
    roles
  };
}

export function createDefaultBuilderState() {
  return createPresetState(PRESETS[0].id);
}

export function applyPresetToState(state, presetId) {
  const next = createPresetState(presetId);
  return {
    ...next,
    name: state?.name || next.name
  };
}

export function sanitizeBuilderState(input) {
  const defaults = createDefaultBuilderState();
  const source = input && typeof input === "object" ? input : {};
  const roleSource = source.roles && typeof source.roles === "object" ? source.roles : {};
  const roles = {};

  for (const role of COLOR_ROLES) {
    const current = roleSource[role.id] || {};
    roles[role.id] = {
      color: normalizeHex(current.color, role.defaultColor),
      wash: clamp(current.wash ?? role.defaultWash, 0, 100)
    };
  }

  return {
    name: String(source.name || defaults.name).slice(0, 80),
    presetId: String(source.presetId || defaults.presetId),
    globalWash: clamp(source.globalWash ?? defaults.globalWash, 0, 100),
    backgroundWash: clamp(source.backgroundWash ?? defaults.backgroundWash, 0, 100),
    roles
  };
}

function buildRuleMap(state) {
  const rules = new Map();

  for (const role of COLOR_ROLES) {
    const roleState = state.roles[role.id];
    for (const target of role.targets) {
      const key = selectorKey(target.file, target.selector);
      if (!rules.has(key)) {
        rules.set(key, { file: target.file, selector: target.selector, declarations: [] });
      }
      rules.get(key).declarations.push({
        prop: target.prop,
        value: declarationValue(target, roleState, state)
      });
    }
  }

  for (const target of EFFECT_TARGETS) {
    const key = selectorKey(target.file, target.selector);
    if (!rules.has(key)) {
      rules.set(key, { file: target.file, selector: target.selector, declarations: [] });
    }
    rules.get(key).declarations.push({ prop: target.prop, value: String(target.fixedValue) });
  }

  return rules;
}

export function buildCssByFile(builderState) {
  const state = sanitizeBuilderState(builderState);
  const rules = [...buildRuleMap(state).values()];
  const byFile = new Map(STYLE_FILES.map((file) => [file, []]));

  for (const rule of rules) {
    if (!byFile.has(rule.file)) byFile.set(rule.file, []);
    byFile.get(rule.file).push(rule);
  }

  const cssByFile = {};
  for (const file of STYLE_FILES) {
    const blocks = (byFile.get(file) || [])
      .map((rule) => {
        const declarations = rule.declarations
          .map((item) => `  ${item.prop}: ${item.value};`)
          .join("\n");
        return `${rule.selector}\n{\n${declarations}\n}`;
      })
      .join("\n\n");

    cssByFile[file] = [
      "/* Generated by Deadlock Color Blind Builder. */",
      baseImportForFile(file),
      "",
      blocks
    ].join("\n").trimEnd() + "\n";
  }

  return cssByFile;
}

export function buildCombinedCss(builderState) {
  const cssByFile = buildCssByFile(builderState);
  return STYLE_FILES
    .map((file) => `/* ===== ${file} ===== */\n${cssByFile[file]}`)
    .join("\n");
}

export function buildColorBlindPackage(builderState, options = {}) {
  const state = sanitizeBuilderState(builderState);
  const cssByFile = buildCssByFile(state);
  const baseFiles = buildBaseFiles(options.baseCssByFile);
  const overrideFiles = STYLE_FILES.map((file) => ({
    path: outputPathForFile(file),
    bytes: compileTextResource(cssByFile[file])
  }));
  const files = [...baseFiles, ...overrideFiles];

  return {
    preset: state,
    cssByFile,
    baseFileCount: baseFiles.length,
    files
  };
}
