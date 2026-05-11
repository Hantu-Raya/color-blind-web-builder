import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { STYLE_FILES } from "../src/colorBlindSchema.js";

const PROJECT_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const PAYLOAD_ROOT = path.join(PROJECT_ROOT, "public", "payload", "color-blind-base");
const DEFAULT_REPOSITORY = "Hantu-Raya/Deadlock-mods-collection";
const SOURCE_REPOSITORY = process.env.COLOR_BLIND_SOURCE_REPOSITORY || DEFAULT_REPOSITORY;
const SOURCE_REF = process.env.COLOR_BLIND_SOURCE_REF || "main";
const SOURCE_DIR = process.env.COLOR_BLIND_SOURCE_DIR || "old_color_blind/panorama/styles/base";
const BASE_VPK_ROOT = "panorama/styles/base";
const GITHUB_API = "https://api.github.com";
const RAW_GITHUB = "https://raw.githubusercontent.com";
const USER_AGENT = "color-blind-web-builder-payload-sync";

function pathSegments(value) {
  return String(value || "").split("/").filter(Boolean);
}

function joinRawUrl(...segments) {
  return `${RAW_GITHUB}/${segments.flatMap(pathSegments).map(encodeURIComponent).join("/")}`;
}

function localPath(root, relativePath) {
  return path.join(root, ...pathSegments(relativePath));
}

function normalizeRelativePath(value) {
  const clean = String(value || "").replaceAll("\\", "/").replace(/^\/+/, "");
  if (!clean || clean.includes("../") || clean.startsWith("..")) {
    throw new Error(`Unsafe payload path: ${value}`);
  }
  return clean;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  return await response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  return await response.text();
}

async function resolveSourceCommit() {
  const commit = await fetchJson(`${GITHUB_API}/repos/${SOURCE_REPOSITORY}/commits/${encodeURIComponent(SOURCE_REF)}`);
  if (!commit?.sha || !commit?.commit?.tree?.sha) {
    throw new Error(`GitHub did not return a commit and tree SHA for ${SOURCE_REPOSITORY}@${SOURCE_REF}`);
  }

  return {
    commitSha: commit.sha,
    treeSha: commit.commit.tree.sha
  };
}

async function listBaseCssFiles(treeSha) {
  const tree = await fetchJson(`${GITHUB_API}/repos/${SOURCE_REPOSITORY}/git/trees/${treeSha}?recursive=1`);
  const sourcePrefix = `${SOURCE_DIR.replace(/\/+$/, "")}/`;
  const files = (tree.tree || [])
    .filter((item) => item.type === "blob")
    .map((item) => String(item.path || ""))
    .filter((itemPath) => itemPath.startsWith(sourcePrefix) && itemPath.endsWith(".css"))
    .map((itemPath) => normalizeRelativePath(itemPath.slice(sourcePrefix.length)))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    throw new Error(`No CSS files found under ${SOURCE_REPOSITORY}/${SOURCE_DIR}`);
  }

  const missingExpected = STYLE_FILES.filter((file) => !files.includes(file));
  if (missingExpected.length > 0) {
    throw new Error(`Latest base payload is missing expected CSS files: ${missingExpected.join(", ")}`);
  }

  return [
    ...STYLE_FILES.filter((file) => files.includes(file)),
    ...files.filter((file) => !STYLE_FILES.includes(file))
  ];
}

async function syncBaseFile(commitSha, relativePath) {
  const sourceText = await fetchText(joinRawUrl(SOURCE_REPOSITORY, commitSha, SOURCE_DIR, relativePath));
  const payloadPath = localPath(PAYLOAD_ROOT, `${BASE_VPK_ROOT}/${relativePath}`);
  await mkdir(path.dirname(payloadPath), { recursive: true });
  await writeFile(payloadPath, sourceText, "utf8");
}

async function writePayloadMetadata(commitSha, relativeFiles) {
  const manifest = {
    name: "old-color-blind-base-styles",
    source: `https://github.com/${SOURCE_REPOSITORY}/tree/${SOURCE_REF}/${SOURCE_DIR}`,
    sourceRepository: SOURCE_REPOSITORY,
    sourceRef: SOURCE_REF,
    sourceCommit: commitSha,
    sourcePath: SOURCE_DIR,
    compiler: "Browser Panorama style resource writer",
    files: relativeFiles.map((file) => `${BASE_VPK_ROOT}/${file}`)
  };
  await writeFile(path.join(PAYLOAD_ROOT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function main() {
  const { commitSha, treeSha } = await resolveSourceCommit();
  const relativeFiles = await listBaseCssFiles(treeSha);

  await rm(PAYLOAD_ROOT, { recursive: true, force: true });
  await mkdir(PAYLOAD_ROOT, { recursive: true });
  await Promise.all(relativeFiles.map((file) => syncBaseFile(commitSha, file)));
  await writePayloadMetadata(commitSha, relativeFiles);

  console.log(`Synced ${relativeFiles.length} base CSS files from ${SOURCE_REPOSITORY}@${commitSha}`);
  console.log(`Wrote public/payload/color-blind-base/manifest.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
