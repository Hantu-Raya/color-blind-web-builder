import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowCounterClockwise,
  CheckCircle,
  Copy,
  DownloadSimple,
  FileCode,
  GithubLogo,
  Heart,
  Package,
  Palette,
  SlidersHorizontal,
  UploadSimple,
  WarningCircle
} from "@phosphor-icons/react";
import { COLOR_ROLES, PRESETS, ROLE_CATEGORIES, STYLE_FILES } from "../colorBlindSchema.js";
import {
  applyPresetToState,
  buildColorBlindPackage,
  buildCombinedCss,
  buildCssByFile,
  createDefaultBuilderState,
  sanitizeBuilderState
} from "../packageBuilder.js";
import { writeVpk } from "../vpkWriter.js";
import { downloadBytes, downloadText } from "../download.js";
import { loadBaseStylePayload } from "../baseStylePayload.js";

const ICON_WEIGHT = "duotone";
const INITIAL_STATUS = { kind: "ready", text: "Ready. Pick colors, then build a local VPK.", time: "" };
const SAMPLE_SWATCHES = [
  { roleId: "positive", label: "Ready", help: "Ready abilities, owned items, healing, and positive states." },
  { roleId: "upgrade", label: "Upgrade", help: "Ability upgrades, AP, recommended items, and sell/new item cues." },
  { roleId: "economy", label: "Gold", help: "Souls, gold, purchasable costs, and weapon shop cues." },
  { roleId: "tech", label: "Tech", help: "Tech shop category markings and tech mod headers." },
  { roleId: "disabled", label: "Off", help: "Cooldown, locked, not trained, disabled, and unavailable states." }
];
const SIMILAR_TOOLS = [
  { label: "HP Colors Preset Builder", href: "https://hantu-raya.github.io/hp-colors-preset-builder/" },
  { label: "3D HUD VPK Merger", href: "https://hantu-raya.github.io/3d-hud-web-merger/" }
];

function formatPercent(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

function countTargets(role) {
  return role.targets.length;
}

function clampPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, numeric));
}

function previewAlphaColor(hex, roleWash, strength) {
  const clean = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#FFFFFF";
  const alpha = Math.round((clampPercent(roleWash) * clampPercent(strength) * 255) / 10000);
  return `${clean}${alpha.toString(16).padStart(2, "0")}`;
}

function statusMessage(kind, text) {
  return { kind, text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
}

export default function ColorBlindBuilderIsland() {
  const [builderState, setBuilderState] = useState(() => createDefaultBuilderState());
  const [activeCategory, setActiveCategory] = useState("combat");
  const [previewFile, setPreviewFile] = useState("unit_status.css");
  const [importText, setImportText] = useState("");
  const [basePayload, setBasePayload] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [status, setStatus] = useState(() => INITIAL_STATUS);

  useEffect(() => {
    let isCurrent = true;
    setStatus(statusMessage("ready", "Loading synced base styles."));
    loadBaseStylePayload(import.meta.env.BASE_URL)
      .then((payload) => {
        if (!isCurrent) return;
        setBasePayload(payload);
        setStatus(statusMessage("ready", "Ready. Pick colors, then build a local VPK."));
      })
      .catch((error) => {
        if (!isCurrent) return;
        setStatus(statusMessage("error", error?.message || String(error)));
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const visibleRoles = useMemo(
    () => COLOR_ROLES.filter((role) => role.category === activeCategory),
    [activeCategory]
  );

  const cssByFile = useMemo(() => buildCssByFile(builderState), [builderState]);
  const combinedCss = useMemo(() => buildCombinedCss(builderState), [builderState]);
  const activePreset = PRESETS.find((preset) => preset.id === builderState.presetId) || PRESETS[0];
  const totalTargets = COLOR_ROLES.reduce((sum, role) => sum + countTargets(role), 0);
  const categoryTargetCount = visibleRoles.reduce((sum, role) => sum + countTargets(role), 0);
  const previewColor = (roleId) => {
    const role = builderState.roles[roleId];
    return previewAlphaColor(role.color, role.wash, builderState.globalWash);
  };
  const previewBackground = (roleId) => {
    const role = builderState.roles[roleId];
    return previewAlphaColor(role.color, role.wash, builderState.backgroundWash);
  };

  function updateRole(roleId, patch) {
    setBuilderState((current) => sanitizeBuilderState({
      ...current,
      roles: {
        ...current.roles,
        [roleId]: {
          ...current.roles[roleId],
          ...patch
        }
      }
    }));
  }

  function resetAll() {
    setBuilderState(createDefaultBuilderState());
    setStatus(statusMessage("ready", "Reset to the baseline palette."));
  }

  function handlePresetChange(presetId) {
    setBuilderState((current) => sanitizeBuilderState(applyPresetToState(current, presetId)));
    setStatus(statusMessage("ready", "Preset loaded. Adjust colors or wash intensity before building."));
  }

  function handleImport() {
    try {
      const parsed = JSON.parse(importText);
      setBuilderState(sanitizeBuilderState(parsed));
      setStatus(statusMessage("ok", "Imported builder preset JSON."));
    } catch (error) {
      setStatus(statusMessage("error", error?.message || String(error)));
    }
  }

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(cssByFile[previewFile] || combinedCss);
      setStatus(statusMessage("ok", `Copied ${previewFile} CSS.`));
    } catch (error) {
      setStatus(statusMessage("error", error?.message || String(error)));
    }
  }

  function downloadCss() {
    downloadText("old_color_blind-custom-css.txt", combinedCss);
    setStatus(statusMessage("ok", "Downloaded combined CSS text."));
  }

  function downloadPreset() {
    downloadText("old_color_blind-builder-preset.json", JSON.stringify(builderState, null, 2), "application/json;charset=utf-8");
    setStatus(statusMessage("ok", "Downloaded builder preset JSON."));
  }

  async function buildVpk() {
    try {
      if (!basePayload) {
        throw new Error("Synced base styles are still loading.");
      }
      setIsBuilding(true);
      const { files, baseFileCount } = buildColorBlindPackage(builderState, { baseCssByFile: basePayload.cssByFile });
      const pak = writeVpk(files);
      downloadBytes("pak86_dir.vpk", pak);
      setStatus(statusMessage("ok", `Downloaded pak86_dir.vpk with ${files.length} style files, including ${baseFileCount} base files.`));
    } catch (error) {
      setStatus(statusMessage("error", error?.message || String(error)));
    } finally {
      setIsBuilding(false);
    }
  }

  return (
    <div className="builder-page">
      <section className="builder-hero" aria-label="Builder header">
        <div className="brand-block">
          <div className="brand-topline">
            <span className="eyebrow">Deadlock Panorama CSS</span>
            <a className="support-link" href="https://github.com/sponsors/Hantu-Raya" target="_blank" rel="noreferrer">
              <Heart weight={ICON_WEIGHT} />
              <span>Support</span>
            </a>
          </div>
          <h1>Color Blind Builder</h1>
          <p>Pick a preset, preview HUD colors, then download a local Deadlock mod file.</p>
          <nav className="similar-tools" aria-label="Similar tools">
            <span>Similar tools</span>
            {SIMILAR_TOOLS.map((tool) => (
              <a key={tool.href} href={tool.href} target="_blank" rel="noreferrer">
                {tool.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="hero-console" aria-label="Build status">
          <div className={`status-line ${status.kind}`} role="status">
            {status.kind === "error" ? <WarningCircle weight={ICON_WEIGHT} /> : <CheckCircle weight={ICON_WEIGHT} />}
            <span>{status.text}</span>
            <time>{status.time}</time>
          </div>
          <div className="console-summary" aria-label="Build summary">
            <span>Deadlock colorblind mod</span>
            <strong>pak86_dir.vpk</strong>
            <span>{totalTargets} UI elements</span>
          </div>
        </div>
      </section>

      <section className="top-controls" aria-label="Preset and build controls">
        <label className="field-block" title={activePreset.description}>
          <span>Starting palette</span>
          <select value={activePreset.id} onChange={(event) => handlePresetChange(event.target.value)}>
            {PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>{preset.label}</option>
            ))}
          </select>
        </label>

        <RangeField
          label="Color strength"
          title="Makes HUD tint and text color changes stronger or weaker."
          value={builderState.globalWash}
          min="0"
          max="100"
          onChange={(value) => setBuilderState((current) => sanitizeBuilderState({ ...current, globalWash: value }))}
        />

        <RangeField
          label="Background strength"
          title="Makes filled panels, blocks, and background color changes stronger or weaker."
          value={builderState.backgroundWash}
          min="0"
          max="100"
          onChange={(value) => setBuilderState((current) => sanitizeBuilderState({ ...current, backgroundWash: value }))}
        />

        <div className="build-control">
          <button
            type="button"
            className="primary-action"
            onClick={buildVpk}
            disabled={!basePayload || isBuilding}
            title={basePayload ? "Downloads pak86_dir.vpk locally. It does not edit game files." : "Loading synced base style files."}
          >
            <Package weight={ICON_WEIGHT} />
            <span>Build Local VPK</span>
          </button>
        </div>
        <details className="control-help">
          <summary>
            <strong>What do these controls mean?</strong>
            <span className="disclosure-state"><span className="show">Show</span><span className="hide">Hide</span></span>
          </summary>
          <ul>
            <li><strong>Starting palette:</strong> loads a preset set of colors.</li>
            <li><strong>Color strength:</strong> changes HUD tint and text color intensity.</li>
            <li><strong>Background strength:</strong> changes filled panels, blocks, and background intensity.</li>
          </ul>
        </details>
        <details className="install-note">
          <summary>
            <strong>Install note</strong>
            <span className="disclosure-state"><span className="show">Show</span><span className="hide">Hide</span></span>
          </summary>
          <p>
            The browser downloads <strong>pak86_dir.vpk</strong>. Put it in your Deadlock colorblind mod folder when you are ready.
          </p>
        </details>
      </section>

      <div className="workspace">
        <nav className="category-rail" aria-label="Color target categories">
          {ROLE_CATEGORIES.map((category) => {
            const roles = COLOR_ROLES.filter((role) => role.category === category.id);
            const targetCount = roles.reduce((sum, role) => sum + countTargets(role), 0);
            return (
              <button
                key={category.id}
                type="button"
                className={activeCategory === category.id ? "category-tab active" : "category-tab"}
                onClick={() => setActiveCategory(category.id)}
                title={`${roles.length} roles / ${targetCount} rules`}
              >
                <span>{category.label}</span>
              </button>
            );
          })}
        </nav>

        <section className="role-panel" aria-label="Color role controls">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Editing</span>
              <h2>{ROLE_CATEGORIES.find((category) => category.id === activeCategory)?.label}</h2>
            </div>
            <div className="heading-metric">
              <SlidersHorizontal weight={ICON_WEIGHT} />
              <span>{categoryTargetCount} HUD parts affected</span>
            </div>
          </div>

          <div className="role-grid">
            {visibleRoles.map((role) => {
              const roleState = builderState.roles[role.id];
              return (
                <article className="role-row" key={role.id} title={`${role.description} ${countTargets(role)} affected UI elements.`}>
                  <div className="role-copy">
                    <div className="role-title">
                      <span className="color-dot" style={{ backgroundColor: roleState.color }} />
                      <strong>{role.label}</strong>
                    </div>
                    <details className="role-info">
                      <summary>
                        <span>Info</span>
                        <span className="disclosure-state"><span className="show">Show</span><span className="hide">Hide</span></span>
                      </summary>
                      <p>{role.description} Affects {countTargets(role)} UI elements.</p>
                    </details>
                  </div>

                  <div className="role-controls">
                    <label className="color-control">
                      <span>Color</span>
                      <input
                        type="color"
                        value={roleState.color}
                        onChange={(event) => updateRole(role.id, { color: event.target.value })}
                        aria-label={`${role.label} color`}
                      />
                    </label>
                    <label className="hex-control">
                      <span>Hex</span>
                      <input
                        value={roleState.color}
                        onChange={(event) => updateRole(role.id, { color: event.target.value })}
                        spellCheck="false"
                        aria-label={`${role.label} hex color`}
                      />
                    </label>
                    <RangeField
                      label="Strength"
                      title={`Intensity for ${role.label}.`}
                      value={roleState.wash}
                      min="0"
                      max="100"
                      onChange={(value) => updateRole(role.id, { wash: value })}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="preview-panel" aria-label="Preview and export tools">
          <div className="preview-card sample-card">
            <div className="preview-heading">
              <Palette weight={ICON_WEIGHT} />
              <strong>HUD color preview</strong>
            </div>
            <div className="sample-hud">
              <div className="sample-section-label">Health bars</div>
              <SampleBar label="Enemy health" note="enemy fill" color={previewColor("enemy")} borderColor={previewColor("border")} />
              <SampleBar label="Ally health" note="outline = ally border" color={previewColor("friend")} borderColor={previewColor("friendBorder")} />
              <SampleBar label="Neutral camp" note="neutral health fill" color={previewColor("neutralHealth")} borderColor={previewColor("border")} />
              <div className="sample-section-label">Lane markers</div>
              <div className="sample-lanes">
                {["laneYellow", "laneGreen", "laneBlue"].map((roleId) => (
                  <span key={roleId} style={{ backgroundColor: previewColor(roleId) }} />
                ))}
              </div>
              <div className="sample-section-label">State chips</div>
              <div className="sample-icons">
                {SAMPLE_SWATCHES.map((item) => (
                  <span
                    key={item.roleId}
                    className={`sample-chip sample-chip-${item.roleId}`}
                    style={{ "--chip-color": previewBackground(item.roleId) }}
                    title={item.help}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
              <details className="sample-help">
                <summary>
                  <strong>Color meanings</strong>
                  <span className="disclosure-state"><span className="show">Show</span><span className="hide">Hide</span></span>
                </summary>
                <dl className="sample-legend" aria-label="HUD sample color meanings">
                  {SAMPLE_SWATCHES.map((item) => (
                    <div key={item.roleId}>
                      <dt>{item.label}</dt>
                      <dd>{item.help}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          </div>

          <details className="preview-card export-card">
            <summary className="preview-heading">
              <FileCode weight={ICON_WEIGHT} />
              <strong>Export tools</strong>
              <span className="disclosure-state"><span className="show">Show</span><span className="hide">Hide</span></span>
            </summary>
            <div className="export-body">
              <p className="panel-note">Advanced tools for copying CSS or saving this builder preset.</p>
              <label className="field-block compact">
                <span>Style file</span>
                <select value={previewFile} onChange={(event) => setPreviewFile(event.target.value)}>
                  {STYLE_FILES.map((file) => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </label>
              <div className="preview-actions" aria-label="CSS export actions">
                <button type="button" className="secondary-action" onClick={copyCss}>
                  <Copy weight={ICON_WEIGHT} />
                  <span>Copy</span>
                </button>
                <button type="button" className="secondary-action" onClick={downloadCss}>
                  <DownloadSimple weight={ICON_WEIGHT} />
                  <span>CSS</span>
                </button>
                <button type="button" className="secondary-action" onClick={downloadPreset}>
                  <DownloadSimple weight={ICON_WEIGHT} />
                  <span>Preset</span>
                </button>
                <button type="button" className="secondary-action" onClick={resetAll}>
                  <ArrowCounterClockwise weight={ICON_WEIGHT} />
                  <span>Reset</span>
                </button>
              </div>
              <details className="css-code-card">
                <summary>
                  <strong>Generated CSS</strong>
                  <span className="disclosure-state"><span className="show">Show</span><span className="hide">Hide</span></span>
                </summary>
                <pre className="code-preview">{cssByFile[previewFile]}</pre>
              </details>
            </div>
          </details>

          <details className="preview-card import-card">
            <summary className="preview-heading">
              <UploadSimple weight={ICON_WEIGHT} />
              <strong>Load preset</strong>
              <span className="disclosure-state"><span className="show">Show</span><span className="hide">Hide</span></span>
            </summary>
            <div className="import-body">
              <p className="panel-note">Paste a saved builder preset JSON. This changes the page only.</p>
              <textarea
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder="Paste a builder preset JSON file here"
                rows={5}
              />
              <button type="button" className="secondary-action full" onClick={handleImport}>
                <UploadSimple weight={ICON_WEIGHT} />
                <span>Import JSON</span>
              </button>
            </div>
          </details>
        </aside>
      </div>

      <footer className="builder-footer">
        <p>Local browser build. Apache License 2.0. Unofficial fan tool, not affiliated with Valve.</p>
        <nav aria-label="Project links">
          <a href="https://github.com/Hantu-Raya" target="_blank" rel="noreferrer">
            <GithubLogo weight={ICON_WEIGHT} />
            <span>Hantu-Raya</span>
          </a>
          <a href="https://github.com/Hantu-Raya/color-blind-web-builder" target="_blank" rel="noreferrer">
            <GithubLogo weight={ICON_WEIGHT} />
            <span>Source repo</span>
          </a>
          <a href="https://github.com/Hantu-Raya/color-blind-web-builder/blob/main/LICENSE" target="_blank" rel="noreferrer">
            <FileCode weight={ICON_WEIGHT} />
            <span>Apache 2.0 License</span>
          </a>
          <a href="https://github.com/Hantu-Raya/color-blind-web-builder/blob/main/NOTICE" target="_blank" rel="noreferrer">
            <FileCode weight={ICON_WEIGHT} />
            <span>Notices</span>
          </a>
          <a className="footer-support-link" href="https://github.com/sponsors/Hantu-Raya" target="_blank" rel="noreferrer">
            <Heart weight={ICON_WEIGHT} />
            <span>Support</span>
          </a>
        </nav>
      </footer>
    </div>
  );
}

function RangeField({ label, title, value, min, max, onChange, showHelp = false }) {
  return (
    <label className="range-field" title={title}>
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output>{formatPercent(value)}</output>
      {showHelp ? <small>{title}</small> : null}
    </label>
  );
}

function SampleBar({ label, note, color, borderColor }) {
  const width = label === "Enemy health" ? "68%" : label === "Neutral camp" ? "74%" : "82%";

  return (
    <div className="sample-bar" style={{ borderColor }}>
      <span className="sample-bar-label">
        <strong>{label}</strong>
        <em>{note}</em>
      </span>
      <div className="sample-track">
        <span style={{ backgroundColor: color, width }} />
      </div>
    </div>
  );
}
