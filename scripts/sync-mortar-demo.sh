#!/usr/bin/env bash
# Builds the Mortar and Pestle browser demo and copies it into public/demos/mortar-pestle.
# GitHub Pages serves static files only, so the built output is committed.
# Usage: scripts/sync-mortar-demo.sh [path-to-mortar-and-pestle]
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
src="${1:-${MORTAR_REPO:-$root/../mortar-and-pestle}}"

[ -d "$src/web" ] || { echo "No web/ folder in $src" >&2; exit 1; }
(cd "$src/web" && npm ci --prefer-offline --no-audit --no-fund && npm run build)

dest="$root/public/demos/mortar-pestle"
rm -rf "$dest"
mkdir -p "$(dirname "$dest")"
cp -R "$src/web/dist" "$dest"
echo "Synced $(du -sh "$dest" | cut -f1) to public/demos/mortar-pestle"
