import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bundleFile = join(root, 'dist', 'aliyun-fc', 'index.js');
const webDist = join(root, 'apps', 'web', 'dist');
const artifactsDir = join(root, 'deploy-artifacts');
const stagingDir = join(artifactsDir, 'aliyun-fc-fullstack');
const outputZip = join(artifactsDir, 'aliyun-fc-recognitions.zip');

if (!existsSync(bundleFile)) {
  throw new Error(`Missing FC bundle: ${bundleFile}. Run npm run build:fc first.`);
}

if (!existsSync(webDist)) {
  throw new Error(`Missing web dist: ${webDist}. Run npm run build:web:fc first.`);
}

mkdirSync(artifactsDir, { recursive: true });
rmSync(stagingDir, { recursive: true, force: true });
rmSync(outputZip, { force: true });
mkdirSync(join(stagingDir, 'public'), { recursive: true });

cpSync(bundleFile, join(stagingDir, 'index.js'));
cpSync(webDist, join(stagingDir, 'public'), { recursive: true });

const zip = spawnSync('zip', ['-r', outputZip, 'index.js', 'public'], {
  cwd: stagingDir,
  stdio: 'inherit'
});

if (zip.status !== 0) {
  throw new Error(`zip failed with exit code ${zip.status}`);
}

console.log(`Packaged Aliyun FC fullstack zip: ${outputZip}`);
