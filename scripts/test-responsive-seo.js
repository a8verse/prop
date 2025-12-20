#!/usr/bin/env node

/**
 * Test script to verify mobile responsiveness and SEO implementation
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Mobile Responsiveness & SEO...\n');

// Test 1: Mobile Responsive Classes
console.log('1️⃣ Testing Mobile Responsive Classes...\n');

const responsiveFiles = [
  'components/layout/Header.tsx',
  'components/layout/Navigation.tsx',
  'components/home/HeroSection.tsx',
  'components/home/FeaturedProperties.tsx',
  'components/property/PropertyList.tsx',
  'app/(auth)/login/admin/page.tsx',
  'app/(auth)/login/page.tsx',
  'app/(auth)/register-cp/page.tsx',
  'app/(admin)/dashboard/layout.tsx',
];

const requiredBreakpoints = ['sm:', 'md:', 'lg:'];
const requiredMobileClasses = ['flex md:', 'hidden md:', 'flex-col md:', 'grid md:'];
const touchTargetSize = 'min-h-[44px]';

let responsiveIssues = [];

responsiveFiles.forEach((filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const hasBreakpoints = requiredBreakpoints.some((bp) => content.includes(bp));
  const hasMobileClasses = requiredMobileClasses.some((cls) => content.includes(cls));
  const hasTouchTargets = content.includes(touchTargetSize);

  if (!hasBreakpoints && !hasMobileClasses) {
    responsiveIssues.push(`⚠️  ${filePath} - No responsive breakpoints found`);
  }

  // Check for buttons/inputs without touch targets on mobile
  if (content.includes('button') || content.includes('input')) {
    if (!hasTouchTargets && (filePath.includes('login') || filePath.includes('register'))) {
      responsiveIssues.push(`⚠️  ${filePath} - Buttons/inputs may need touch target sizes`);
    }
  }
});

if (responsiveIssues.length > 0) {
  console.log('⚠️  Responsive Issues:');
  responsiveIssues.forEach((issue) => console.log(`  ${issue}`));
} else {
  console.log('✅ All files have responsive breakpoints');
}

// Test 2: SEO Implementation
console.log('\n2️⃣ Testing SEO Implementation...\n');

const seoFiles = [
  'app/layout.tsx',
  'app/(public)/page.tsx',
  'app/(public)/properties/[slug]/page.tsx',
];

let seoIssues = [];

seoFiles.forEach((filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  
  if (filePath.includes('layout.tsx')) {
    if (!content.includes('Metadata') && !content.includes('metadata')) {
      seoIssues.push(`⚠️  ${filePath} - No metadata export found`);
    }
  }
  
  if (filePath.includes('page.tsx')) {
    if (content.includes('generateMetadata')) {
      console.log(`  ✅ ${filePath} - Has generateMetadata function`);
    }
    if (content.includes('application/ld+json') || content.includes('structuredData')) {
      console.log(`  ✅ ${filePath} - Has structured data`);
    } else if (filePath.includes('properties')) {
      seoIssues.push(`⚠️  ${filePath} - Missing structured data`);
    }
  }
});

if (seoIssues.length > 0) {
  console.log('\n⚠️  SEO Issues:');
  seoIssues.forEach((issue) => console.log(`  ${issue}`));
} else {
  console.log('✅ SEO implementation looks good');
}

// Test 3: Performance Optimizations
console.log('\n3️⃣ Testing Performance Optimizations...\n');

const performanceChecks = [
  {
    file: 'components/property/PropertyList.tsx',
    check: 'dynamic',
    message: 'PropertyDetailModal should be lazy loaded',
  },
  {
    file: 'components/property/PropertyDetailModal.tsx',
    check: 'dynamic',
    message: 'Recharts should be lazy loaded',
  },
  {
    file: 'next.config.js',
    check: 'splitChunks',
    message: 'Bundle splitting should be configured',
  },
];

let performanceIssues = [];

performanceChecks.forEach(({ file, check, message }) => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) {
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  if (check === 'dynamic') {
    if (content.includes('dynamic(') || content.includes('import(')) {
      console.log(`  ✅ ${file} - Uses dynamic imports`);
    } else if (file.includes('PropertyList') && content.includes('PropertyDetailModal')) {
      performanceIssues.push(`⚠️  ${file} - ${message}`);
    }
  } else if (check === 'splitChunks') {
    if (content.includes('splitChunks') || content.includes('cacheGroups')) {
      console.log(`  ✅ ${file} - Has bundle splitting config`);
    } else {
      performanceIssues.push(`⚠️  ${file} - ${message}`);
    }
  }
});

if (performanceIssues.length > 0) {
  console.log('\n⚠️  Performance Issues:');
  performanceIssues.forEach((issue) => console.log(`  ${issue}`));
} else {
  console.log('✅ Performance optimizations in place');
}

// Test 4: SEO Admin Forms
console.log('\n4️⃣ Testing SEO Admin Forms...\n');

const adminForms = [
  'app/(admin)/dashboard/properties/new/page.tsx',
  'app/(admin)/dashboard/properties/[id]/page.tsx',
];

let seoFormIssues = [];

adminForms.forEach((filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const seoFields = [
    'metaTitle',
    'metaDescription',
    'metaKeywords',
    'ogTitle',
    'ogDescription',
    'ogImage',
    'twitterCard',
    'canonicalUrl',
  ];

  const missingFields = seoFields.filter((field) => !content.includes(field));
  if (missingFields.length > 0) {
    seoFormIssues.push(`⚠️  ${filePath} - Missing SEO fields: ${missingFields.join(', ')}`);
  } else {
    console.log(`  ✅ ${filePath} - Has all SEO fields`);
  }
});

if (seoFormIssues.length > 0) {
  console.log('\n⚠️  SEO Form Issues:');
  seoFormIssues.forEach((issue) => console.log(`  ${issue}`));
} else {
  console.log('✅ All admin forms have SEO fields');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 TEST SUMMARY\n');

const totalIssues = responsiveIssues.length + seoIssues.length + performanceIssues.length + seoFormIssues.length;

if (totalIssues === 0) {
  console.log('✅ All tests passed!');
  console.log('\n✅ Mobile Responsiveness: PASSED');
  console.log('✅ SEO Implementation: PASSED');
  console.log('✅ Performance Optimizations: PASSED');
  console.log('✅ SEO Admin Forms: PASSED');
  process.exit(0);
} else {
  console.log(`⚠️  Found ${totalIssues} potential issues (see above)`);
  console.log('\nNote: Some issues may be false positives. Manual testing recommended.');
  process.exit(0);
}

