#!/usr/bin/env bash
# Builds the Mortar and Pestle browser demo and copies it into public/demos/mortar-pestle.
# GitHub Pages serves static files only, so the built output is committed.
# Usage: scripts/sync-mortar-demo.sh [path-to-mortar-and-pestle]
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
src="${1:-${MORTAR_REPO:-$root/../mortar-and-pestle}}"

[ -d "$src/web" ] || { echo "No web/ folder in $src" >&2; exit 1; }
(cd "$src/web" && npm ci --prefer-offline --no-audit --no-fund && npm run build)

# DEST overrides the target. The tests use it so they never touch the committed demo.
dest="${DEST:-$root/public/demos/mortar-pestle}"
[ -f "$src/web/dist/index.html" ] || { echo "Build made no web/dist/index.html in $src" >&2; exit 1; }
rm -rf "$dest"
mkdir -p "$(dirname "$dest")"
cp -R "$src/web/dist" "$dest"
echo "Synced $(du -sh "$dest" | cut -f1) to $dest"
