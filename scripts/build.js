const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

run('npx prisma generate');

if (process.env.DATABASE_URL) {
  // Ensure tables are created/updated in hosted DB during deployment builds.
  run('npx prisma db push --accept-data-loss');
} else {
  console.log('DATABASE_URL not set. Skipping prisma db push.');
}

// Copy the static frontend into public/ so Vercel serves it from its CDN.
// (Source files stay at the repo root so server.js / Docker keep working.)
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public');
const staticEntries = ['index.html', 'style.css', 'js'];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of staticEntries) {
  fs.cpSync(path.join(root, entry), path.join(outDir, entry), { recursive: true });
}

console.log(`Copied static assets to ${path.relative(root, outDir)}/: ${staticEntries.join(', ')}`);
