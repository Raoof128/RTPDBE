#!/usr/bin/env node

/**
 * Build Script for RTPDBE
 * Creates a production-ready distribution package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building Real-Time Phishing Detection Extension...\n');

// Configuration
const BUILD_DIR = 'dist';
const FILES_TO_COPY = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.js',
  'warning.html',
  'warning.js',
  'LICENSE',
  'README.md'
];

const DIRS_TO_COPY = [
  'icons'
];

// Step 1: Clean build directory
console.log('📁 Cleaning build directory...');
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true });
}
fs.mkdirSync(BUILD_DIR, { recursive: true });
console.log('✓ Build directory cleaned\n');

// Step 2: Generate icons
console.log('🎨 Generating icons...');
try {
  execSync('node generate-icons.js', { stdio: 'inherit' });
  console.log('✓ Icons generated\n');
} catch (error) {
  console.error('✗ Failed to generate icons');
  process.exit(1);
}

// Step 3: Copy files
console.log('📋 Copying files...');
FILES_TO_COPY.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(BUILD_DIR, file));
    console.log(`  ✓ ${file}`);
  } else {
    console.warn(`  ⚠ ${file} not found, skipping`);
  }
});
console.log();

// Step 4: Copy directories
console.log('📁 Copying directories...');
DIRS_TO_COPY.forEach(dir => {
  if (fs.existsSync(dir)) {
    const destDir = path.join(BUILD_DIR, dir);
    fs.mkdirSync(destDir, { recursive: true });
    copyDirectory(dir, destDir);
    console.log(`  ✓ ${dir}/`);
  } else {
    console.warn(`  ⚠ ${dir}/ not found, skipping`);
  }
});
console.log();

// Step 5: Validate manifest
console.log('🔍 Validating manifest...');
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'manifest.json'), 'utf8'));
  console.log(`  ✓ Extension: ${manifest.name}`);
  console.log(`  ✓ Version: ${manifest.version}`);
  console.log(`  ✓ Manifest V${manifest.manifest_version}`);
} catch (error) {
  console.error('✗ Invalid manifest.json');
  process.exit(1);
}
console.log();

// Step 6: Create ZIP
console.log('📦 Creating distribution package...');
const version = require('../package.json').version;
const zipName = `rtpdbe-v${version}.zip`;

try {
  execSync(`cd ${BUILD_DIR} && zip -r ../${zipName} *`, { stdio: 'pipe' });
  const stats = fs.statSync(zipName);
  console.log(`✓ Created ${zipName} (${(stats.size / 1024).toFixed(2)} KB)\n`);
} catch (error) {
  console.error('✗ Failed to create ZIP package');
  process.exit(1);
}

// Summary
console.log('✅ Build completed successfully!\n');
console.log('📦 Distribution package:', zipName);
console.log('📁 Build directory:', BUILD_DIR);
console.log('\nNext steps:');
console.log('  1. Test the extension: Load', BUILD_DIR, 'in your browser');
console.log('  2. Submit to Chrome Web Store:', zipName);
console.log('  3. Create GitHub release with', zipName);

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
