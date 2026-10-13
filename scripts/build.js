const { execSync } = require('child_process');

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
