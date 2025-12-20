#!/usr/bin/env node

/**
 * Test script to verify hooks are called in correct order
 * This checks for common patterns that violate Rules of Hooks
 */

const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'app/(admin)/dashboard/layout.tsx',
  'app/(auth)/login/admin/page.tsx',
  'components/auth/ChannelPartnerLoginModal.tsx',
  'components/auth/VisitorLoginModal.tsx',
];

const hookPatterns = [
  /useState\s*\(/g,
  /useEffect\s*\(/g,
  /useSession\s*\(/g,
  /useRouter\s*\(/g,
  /useRef\s*\(/g,
  /useCallback\s*\(/g,
  /useMemo\s*\(/g,
];

const returnPattern = /^\s*return\s+/m;
const conditionalReturnPattern = /if\s*\([^)]+\)\s*\{[^}]*return[^}]*\}/gs;

let errors = [];
let warnings = [];

filesToCheck.forEach((filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    warnings.push(`File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  // Check if hooks are called after conditional returns
  let foundReturn = false;
  let hookCount = 0;
  let returnLine = -1;

  lines.forEach((line, index) => {
    // Check for early returns
    if (returnPattern.test(line) && !line.includes('return ()')) {
      if (returnLine === -1) {
        returnLine = index + 1;
        foundReturn = true;
      }
    }

    // Count hooks
    hookPatterns.forEach((pattern) => {
      if (pattern.test(line)) {
        hookCount++;
        if (foundReturn && returnLine > 0 && index + 1 > returnLine) {
          errors.push(
            `❌ ${filePath}:${index + 1} - Hook called after return statement (line ${returnLine})`
          );
        }
      }
    });
  });

  // Check for conditional hook calls
  if (conditionalReturnPattern.test(content)) {
    const matches = content.match(conditionalReturnPattern);
    matches?.forEach((match) => {
      hookPatterns.forEach((pattern) => {
        if (pattern.test(match)) {
          errors.push(
            `❌ ${filePath} - Hook called conditionally inside if statement`
          );
        }
      });
    });
  }

  // Verify all hooks are at the top
  const hookLines = [];
  lines.forEach((line, index) => {
    hookPatterns.forEach((pattern) => {
      if (pattern.test(line)) {
        hookLines.push({ line: index + 1, content: line.trim() });
      }
    });
  });

  if (hookLines.length > 0 && returnLine > 0) {
    const hooksAfterReturn = hookLines.filter((h) => h.line > returnLine);
    if (hooksAfterReturn.length > 0) {
      errors.push(
        `❌ ${filePath} - Hooks found after return statement:\n${hooksAfterReturn
          .map((h) => `   Line ${h.line}: ${h.content}`)
          .join('\n')}`
      );
    }
  }
});

console.log('🔍 Testing Hooks Order...\n');

if (errors.length > 0) {
  console.log('❌ ERRORS FOUND:\n');
  errors.forEach((error) => console.log(error));
  process.exit(1);
} else {
  console.log('✅ All hooks are called in correct order!\n');
  console.log('Verified files:');
  filesToCheck.forEach((file) => console.log(`  ✓ ${file}`));
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach((warning) => console.log(`  ${warning}`));
  }
  
  console.log('\n✅ Hooks order test passed!');
  process.exit(0);
}

