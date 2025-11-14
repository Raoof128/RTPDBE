#!/usr/bin/env node

/**
 * Release Script for RTPDBE
 * Prepares a new release with version bump and changelog
 */

const fs = require('fs');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // major, minor, or patch

console.log(`🚀 Preparing ${versionType} release...\n`);

// Read current version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

const currentVersion = packageJson.version;
console.log(`Current version: ${currentVersion}`);

// Calculate new version
const [major, minor, patch] = currentVersion.split('.').map(Number);
let newVersion;

switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
  default:
    console.error('Invalid version type. Use: major, minor, or patch');
    process.exit(1);
}

console.log(`New version: ${newVersion}\n`);

// Confirm
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question(`Proceed with release ${newVersion}? (y/n) `, (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Release cancelled');
    process.exit(0);
  }

  // Update package.json
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✓ Updated package.json');

  // Update manifest.json
  manifest.version = newVersion;
  fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log('✓ Updated manifest.json');

  // Update CHANGELOG.md
  const date = new Date().toISOString().split('T')[0];
  const changelogEntry = `## [${newVersion}] - ${date}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n`;

  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  const updatedChangelog = changelog.replace('# Changelog', `# Changelog\n\n${changelogEntry}`);
  fs.writeFileSync('CHANGELOG.md', updatedChangelog);
  console.log('✓ Updated CHANGELOG.md');

  console.log('\n✅ Version bumped to', newVersion);
  console.log('\nNext steps:');
  console.log('  1. Update CHANGELOG.md with actual changes');
  console.log(`  2. git add -A`);
  console.log(`  3. git commit -m "Release v${newVersion}"`);
  console.log(`  4. git tag v${newVersion}`);
  console.log('  5. git push && git push --tags');
  console.log('  6. npm run build');
  console.log('  7. Create GitHub release');

  readline.close();
});
