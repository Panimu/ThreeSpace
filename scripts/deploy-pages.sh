#!/usr/bin/env bash
# Build and publish the game to GitHub Pages (gh-pages branch).
# Site: https://panimu.github.io/ThreeSpace/
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build
REMOTE=$(git config --get remote.origin.url)

cd dist
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy to GitHub Pages"
git push -f "$REMOTE" gh-pages
rm -rf .git
echo "Deployed to gh-pages."
