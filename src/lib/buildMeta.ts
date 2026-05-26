import { execSync } from 'node:child_process';

export interface BuildMeta {
  shortHash: string;
  fullHash: string;
  subject: string;
  commitDate: string;
  branch: string;
  buildDate: string;
}

function safe(cmd: string, fallback: string): string {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return fallback; }
}

const buildDate = (() => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
})();

const SNAPSHOT: BuildMeta = Object.freeze({
  shortHash:  safe('git rev-parse --short HEAD', 'nogit'),
  fullHash:   safe('git rev-parse HEAD', ''),
  subject:    safe('git log -1 --pretty=%s', ''),
  commitDate: safe('git log -1 --pretty=%as', new Date().toISOString().slice(0, 10)),
  branch:     safe('git rev-parse --abbrev-ref HEAD', ''),
  buildDate,
});

export function getBuildMeta(): BuildMeta {
  return SNAPSHOT;
}

// Deprecated alias — remove in Task 11 once all MetaBar callers are updated.
export function getLegacyBuildMeta() {
  return {
    date: SNAPSHOT.buildDate,
    hash: SNAPSHOT.shortHash,
    coords: 'N 42°39′ W 71°08′',
  };
}
