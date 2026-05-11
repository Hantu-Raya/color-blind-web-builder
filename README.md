# Deadlock Color Blind Builder

Browser-only builder for the `old_color_blind` Deadlock Panorama CSS override pack.

Live page: https://hantu-raya.github.io/color-blind-web-builder/

## Commands

```powershell
npm install
npm run dev
npm run payload:sync
npm test
npm run build
```

The app builds `pak86_dir.vpk` locally in the browser. It does not upload selected
files or presets. The VPK includes generated override styles plus the synced
`old_color_blind/panorama/styles/base` files those overrides import.

## Payload Refresh

The bundled base payload is synced from the latest `main` source in:

```text
https://github.com/Hantu-Raya/Deadlock-mods-collection/tree/main/old_color_blind/panorama/styles/base
```

Run `npm run payload:sync` to refresh `public/payload/color-blind-base/` and
record the upstream commit in its manifest.
