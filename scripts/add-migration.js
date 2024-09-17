const execSync = require('child_process').execSync;

const arg = process.argv[2];
if (!arg) throw new Error('😲 Pass the name for migration');

try {
  const generateCommand = `typeorm-ts-node-commonjs migration:generate -d ./typeorm.config.ts ./migrations/${arg}`;

  execSync(generateCommand, { stdio: 'inherit' });
} catch (error) {
  console.error('Error during migration:', error);
  process.exit(1);
}
