import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';

// The build stamp: a commit count, so builds sort and a player can say "I'm on
// 48", plus the short SHA so that number traces back to a commit.
//
// Anything that would make the stamp a lie degrades to 'dev build' instead: no
// git at all, a shallow clone (where the count is whatever depth was fetched,
// not the real history), or a dirty tree (a build that matches no commit). A
// version nobody can look up is worse than an honest "dev build" — and
// src/update.js refuses to poll on one, so a working copy never nags about
// updates it can't meaningfully compare against.
function buildVersion() {
  const git = (args) => execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString().trim();
  try {
    if (git('rev-parse --is-shallow-repository') === 'true') return 'dev build';
    if (git('status --porcelain')) return 'dev build';
    return `${git('rev-list --count HEAD')}.${git('rev-parse --short HEAD')}`;
  } catch {
    return 'dev build';
  }
}

// Publishes the stamp next to the bundle so a running client can learn about a
// new deploy with one small request, instead of parsing the bundle it would
// have to download to read. The entry chunk's name rides along so the client
// can warm the new bundle into the HTTP cache before anyone taps update.
function versionManifest(version) {
  return {
    name: 'threespace-version-manifest',
    apply: 'build',
    generateBundle(_options, bundle) {
      const entry = Object.values(bundle).find((c) => c.type === 'chunk' && c.isEntry);
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: `${JSON.stringify({ version, bundle: entry?.fileName ?? null }, null, 2)}\n`,
      });
    },
  };
}

const BUILD_VERSION = buildVersion();

export default defineConfig({
  // Serve the asset packs at the web root, e.g. /space-shooter-redux/PNG/...
  publicDir: 'assets',
  base: './',
  // Compile-time constant: the running game never looks this up.
  define: { __BUILD_VERSION__: JSON.stringify(BUILD_VERSION) },
  plugins: [versionManifest(BUILD_VERSION)],
});
