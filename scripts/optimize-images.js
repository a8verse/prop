#!/usr/bin/env node

/**
 * Image Optimization Script
 * Optimizes images in public/uploads/ and public/images/ directories
 * - Compresses images
 * - Generates WebP versions
 * - Resizes large images
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { existsSync } = require('fs');

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 85;

async function optimizeImage(inputPath, outputPath, options = {}) {
  try {
    const stats = await fs.stat(inputPath);
    const originalSize = stats.size;

    let image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize if too large
    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      image = image.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Optimize based on format
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      await image
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(outputPath);
    } else if (metadata.format === 'png') {
      await image
        .png({ quality: QUALITY, compressionLevel: 9 })
        .toFile(outputPath);
    } else if (metadata.format === 'webp') {
      await image
        .webp({ quality: QUALITY })
        .toFile(outputPath);
    } else {
      // For other formats, just copy
      await fs.copyFile(inputPath, outputPath);
    }

    const newStats = await fs.stat(outputPath);
    const newSize = newStats.size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    return {
      success: true,
      originalSize,
      newSize,
      savings: `${savings}%`,
    };
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function generateWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: QUALITY })
      .toFile(outputPath);
    return { success: true };
  } catch (error) {
    console.error(`Error generating WebP for ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function processDirectory(dirPath) {
  const results = {
    optimized: 0,
    webpGenerated: 0,
    errors: 0,
    totalSavings: 0,
  };

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively process subdirectories
        const subResults = await processDirectory(fullPath);
        results.optimized += subResults.optimized;
        results.webpGenerated += subResults.webpGenerated;
        results.errors += subResults.errors;
        results.totalSavings += subResults.totalSavings;
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);

        if (isImage) {
          // Skip if already optimized (contains _optimized or _webp)
          if (entry.name.includes('_optimized') || entry.name.includes('_webp')) {
            continue;
          }

          const optimizedName = entry.name.replace(/(\.[^.]+)$/, '_optimized$1');
          const optimizedPath = path.join(dirPath, optimizedName);

          // Optimize image
          const optimizeResult = await optimizeImage(fullPath, optimizedPath);
          if (optimizeResult.success) {
            results.optimized++;
            results.totalSavings += optimizeResult.originalSize - optimizeResult.newSize;
            console.log(`✅ Optimized: ${entry.name} (${optimizeResult.savings} smaller)`);
          } else {
            results.errors++;
          }

          // Generate WebP version (except if already WebP)
          if (ext !== '.webp') {
            const webpName = entry.name.replace(/(\.[^.]+)$/, '.webp');
            const webpPath = path.join(dirPath, webpName);

            const webpResult = await generateWebP(fullPath, webpPath);
            if (webpResult.success) {
              results.webpGenerated++;
              console.log(`✅ Generated WebP: ${webpName}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }

  return results;
}

async function main() {
  console.log('\n🖼️  Image Optimization Script\n');

  const directories = [
    path.join(process.cwd(), 'public', 'uploads'),
    path.join(process.cwd(), 'public', 'images'),
  ];

  let totalResults = {
    optimized: 0,
    webpGenerated: 0,
    errors: 0,
    totalSavings: 0,
  };

  for (const dir of directories) {
    if (existsSync(dir)) {
      console.log(`\n📁 Processing: ${dir}\n`);
      const results = await processDirectory(dir);
      totalResults.optimized += results.optimized;
      totalResults.webpGenerated += results.webpGenerated;
      totalResults.errors += results.errors;
      totalResults.totalSavings += results.totalSavings;
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Optimized images: ${totalResults.optimized}`);
  console.log(`   WebP versions generated: ${totalResults.webpGenerated}`);
  console.log(`   Errors: ${totalResults.errors}`);
  console.log(`   Total space saved: ${(totalResults.totalSavings / 1024 / 1024).toFixed(2)} MB`);
  console.log('\n✅ Optimization complete!\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

