function joinUrl(baseUrl, path) {
  const base = String(baseUrl || "/");
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  return `${cleanBase}${String(path).replace(/^\/+/, "")}`;
}

function normalizeManifestPath(path) {
  return String(path || "").replaceAll("\\", "/").replace(/^\/+/, "");
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url} (${response.status})`);
  }
  return await response.text();
}

export async function loadBaseStylePayload(baseUrl = "/") {
  const manifestUrl = joinUrl(baseUrl, "payload/color-blind-base/manifest.json");
  const manifestResponse = await fetch(manifestUrl);
  if (!manifestResponse.ok) {
    throw new Error(`Failed to load colorblind base payload manifest (${manifestResponse.status})`);
  }

  const manifest = await manifestResponse.json();
  if (!manifest || !Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error("Colorblind base payload manifest has no files");
  }

  const prefix = "panorama/styles/base/";
  const entries = await Promise.all(manifest.files.map(async (rawPath) => {
    const path = normalizeManifestPath(rawPath);
    if (!path.startsWith(prefix) || !path.endsWith(".css")) {
      throw new Error(`Unexpected base style payload path: ${rawPath}`);
    }
    const file = path.slice(prefix.length);
    const css = await fetchText(joinUrl(baseUrl, `payload/color-blind-base/${path}`));
    return [file, css];
  }));

  return {
    manifest,
    cssByFile: Object.fromEntries(entries),
    totalBytes: entries.reduce((sum, [, css]) => sum + new TextEncoder().encode(css).byteLength, 0)
  };
}
