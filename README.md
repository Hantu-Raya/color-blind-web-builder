# Deadlock Color Blind Builder

Browser-only builder for the `old_color_blind` Deadlock Panorama CSS override pack.

Live page: https://hantu-raya.github.io/color-blind-web-builder/

The tool builds `pak86_dir.vpk` locally in the browser. It does not upload selected
files, generated CSS, presets, or VPKs. The VPK includes generated override styles
plus the synced `old_color_blind/panorama/styles/base` files those overrides import.

## Run Locally

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:4321/color-blind-web-builder/` or the port Astro prints.

## Commands

```powershell
npm run payload:sync
npm test
npm run build
npm run check
```

## Payload Refresh

The bundled base payload is synced from the latest `main` source in:

```text
https://github.com/Hantu-Raya/Deadlock-mods-collection/tree/main/old_color_blind/panorama/styles/base
```

Run `npm run payload:sync` to refresh `public/payload/color-blind-base/` and
record the upstream commit in its manifest.

## GitHub Pages

This repo is configured for project Pages at:

```text
https://hantu-raya.github.io/color-blind-web-builder/
```

In the GitHub repository settings, set Pages to **GitHub Actions**. The included
workflow tests, builds, and deploys `dist` on pushes to `main`.

## Verification

```powershell
npm run check
```

## Notes

- VPK files are processed locally; the web app does not upload them to a server.
- This is an unofficial fan-made tool and is not affiliated with Valve.

## License

MIT. See `LICENSE` and `NOTICE.md`.
