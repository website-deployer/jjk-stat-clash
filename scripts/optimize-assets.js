#!/usr/bin/env node

/**
 * Asset Optimization Script
 * 
 * This script helps optimize large assets for better performance.
 * Run with: node scripts/optimize-assets.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

console.log('🔍 Analyzing assets for optimization...\n');

// Check for video files
const videoFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.mov'));
if (videoFiles.length > 0) {
  console.log('📹 Video files found:');
  videoFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  - ${file}: ${sizeMB} MB`);
  });
  console.log('\n💡 Optimization recommendations:\n');
  console.log('  1. Convert to WebM format (better compression)');
  console.log('  2. Reduce resolution to 720p or lower');
  console.log('  3. Use H.265/HEVC codec for better compression');
  console.log('  4. Target size: < 5 MB');
  console.log('\n  Recommended tools:');
  console.log('  - FFmpeg: ffmpeg -i input.mp4 -c:v libx265 -crf 28 output.webm');
  console.log('  - HandBrake: Use "Fast 1080p30" or "Fast 720p30" preset');
}

// Check for GIF files
const gifFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.gif'));
if (gifFiles.length > 0) {
  console.log('\n🖼️  GIF files found:');
  gifFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  - ${file}: ${sizeMB} MB`);
  });
  console.log('\n💡 Optimization recommendations:\n');
  console.log('  1. Convert to WebP (better compression)');
  console.log('  2. Reduce frame rate to 10-15 fps');
  console.log('  3. Reduce color depth to 256 colors');
  console.log('  4. Target size: < 500 KB');
  console.log('\n  Recommended tools:');
  console.log('  - FFmpeg: ffmpeg -i input.gif -vf "fps=10,scale=320:-1:flags=lanczos" output.webp');
  console.log('  - Gifsicle: gifsicle --optimize=3 input.gif > output.gif');
}

// Check for image files
const imageFiles = fs.readdirSync(publicDir).filter(file => file.match(/\.(png|jpg|jpeg)$/i));
if (imageFiles.length > 0) {
  console.log('\n🖼️  Image files found:');
  imageFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  - ${file}: ${sizeKB} KB`);
  });
  console.log('\n💡 Optimization recommendations:\n');
  console.log('  1. Convert to WebP format (30-50% smaller)');
  console.log('  2. Use modern compression (mozjpeg, oxipng)');
  console.log('  3. Target size: < 100 KB for most images');
  console.log('\n  Recommended tools:');
  console.log('  - FFmpeg: ffmpeg -i input.jpg -vcodec libwebp -q:v 80 output.webp');
  console.log('  - cwebp: cwebp -q 80 input.jpg -o output.webp');
}

console.log('\n✅ Asset analysis complete!\n');
console.log('📝 To optimize assets, consider using:');
console.log('   - FFmpeg for video and image conversion');
console.log('   - Gifsicle for GIF optimization');
console.log('   - ImageMagick for batch processing');
console.log('   - Vite plugins: vite-plugin-imagemin, vite-plugin-compression');