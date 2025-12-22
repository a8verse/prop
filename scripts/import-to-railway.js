#!/usr/bin/env node

/**
 * Quick Import Script: Import SQL file to Railway MySQL
 */

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 Railway SQL Import Script\n');

  // Get SQL file path
  const sqlFile = '/Users/eaklovyachawla/Desktop/property new/property_portal_export_cleaned.sql';
  
  // Check if file exists
  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ File not found: ${sqlFile}`);
    console.log('\nLooking for similar files...');
    const dir = '/Users/eaklovyachawla/Desktop/property new';
    try {
      const files = fs.readdirSync(dir).filter(f => f.includes('property_portal') || f.includes('.sql'));
      if (files.length > 0) {
        console.log('Found files:');
        files.forEach(f => console.log(`  - ${f}`));
      }
    } catch (e) {
      // Ignore
    }
    process.exit(1);
  }

  const stats = fs.statSync(sqlFile);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Found SQL file: ${sqlFile}`);
  console.log(`📊 Size: ${fileSizeMB} MB\n`);

  // Get Railway connection string
  console.log('=== Railway Connection ===\n');
  console.log('To get your Railway connection string:');
  console.log('1. Go to railway.app → Your Project → MySQL Service');
  console.log('2. Click "Variables" tab or "Connect"');
  console.log('3. Copy MYSQL_URL or DATABASE_URL\n');
  
  const railwayUrl = await question('Paste Railway MySQL connection string: ');
  
  if (!railwayUrl || !railwayUrl.includes('mysql://')) {
    console.error('❌ Invalid connection string. Must start with mysql://');
    process.exit(1);
  }

  // Parse connection string
  let railwayParsed;
  try {
    const url = new URL(railwayUrl.replace(/^mysql:\/\//, 'http://'));
    railwayParsed = {
      host: url.hostname,
      port: url.port || '3306',
      user: url.username,
      password: url.password,
      database: url.pathname.replace('/', ''),
    };
    console.log('\n✅ Connection details parsed:');
    console.log(`   Host: ${railwayParsed.host}`);
    console.log(`   Port: ${railwayParsed.port}`);
    console.log(`   Database: ${railwayParsed.database}\n`);
  } catch (error) {
    console.error('❌ Failed to parse connection string');
    console.error('Error:', error.message);
    process.exit(1);
  }

  // Step 1: Create tables using Prisma
  console.log('=== Step 1: Creating Tables ===\n');
  console.log('Setting up database schema with Prisma...\n');
  
  // Backup and update .env
  const envPath = path.join(__dirname, '../.env');
  const envBackup = envPath + '.backup';
  let originalEnv = '';
  
  if (fs.existsSync(envPath)) {
    originalEnv = fs.readFileSync(envPath, 'utf8');
    fs.writeFileSync(envBackup, originalEnv);
  }
  
  // Update .env with Railway connection
  let newEnv = originalEnv;
  if (newEnv.includes('DATABASE_URL=')) {
    newEnv = newEnv.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${railwayUrl}"`);
  } else {
    newEnv += `\nDATABASE_URL="${railwayUrl}"\n`;
  }
  fs.writeFileSync(envPath, newEnv);
  
  try {
    console.log('Running Prisma migrations...');
    // Use local Prisma version from node_modules (avoid installing Prisma 7)
    const prismaPath = path.join(__dirname, '../node_modules/.bin/prisma');
    if (fs.existsSync(prismaPath)) {
      execSync(`"${prismaPath}" migrate deploy`, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
    } else {
      // Fallback: use npx with specific version
      execSync('npx prisma@5.19.0 migrate deploy', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
    }
    console.log('✅ Tables created successfully!\n');
  } catch (error) {
    console.error('❌ Failed to create tables');
    console.error('Error:', error.message);
    // Restore .env
    if (fs.existsSync(envBackup)) {
      fs.writeFileSync(envPath, fs.readFileSync(envBackup, 'utf8'));
      fs.unlinkSync(envBackup);
    }
    process.exit(1);
  }

  // Step 2: Import SQL file
  console.log('=== Step 2: Importing Data ===\n');
  console.log(`Importing ${fileSizeMB} MB of data...\n`);
  
  try {
    // Build mysql import command
    const importCommand = `mysql -h ${railwayParsed.host} -P ${railwayParsed.port} -u ${railwayParsed.user} -p${railwayParsed.password} ${railwayParsed.database} < "${sqlFile}"`;
    
    console.log('Importing SQL file (this may take a few minutes)...');
    execSync(importCommand, { 
      stdio: 'inherit',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    
    console.log('\n✅ Data imported successfully!\n');
  } catch (error) {
    console.error('\n❌ Import failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Alternative methods:');
    console.error('1. Use Railway web terminal:');
    console.error('   - Go to Railway → MySQL service → Connect');
    console.error('   - Use: mysql -u root -p < your_file.sql');
    console.error('2. Use MySQL Workbench or similar tool');
    console.error('3. Split the SQL file if it\'s too large\n');
  }

  // Step 3: Test connection
  console.log('=== Step 3: Testing Connection ===\n');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    
    const categories = await prisma.category.count();
    const properties = await prisma.property.count();
    const users = await prisma.user.count();
    const sliderImages = await prisma.sliderImage.count();
    
    console.log('✅ Connection successful!');
    console.log(`   Categories: ${categories}`);
    console.log(`   Properties: ${properties}`);
    console.log(`   Users: ${users}`);
    console.log(`   Slider Images: ${sliderImages}\n`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('⚠️  Connection test failed (data may still be imported)');
    console.error('Error:', error.message);
  }

  // Restore original .env
  if (fs.existsSync(envBackup)) {
    fs.writeFileSync(envPath, fs.readFileSync(envBackup, 'utf8'));
    fs.unlinkSync(envBackup);
    console.log('✅ Restored original .env file\n');
  }

  // Final instructions
  console.log('=== Next Steps ===\n');
  console.log('1. Update Vercel DATABASE_URL:');
  console.log('   - Go to Vercel Dashboard → Project → Settings → Environment Variables');
  console.log('   - Update DATABASE_URL with Railway connection string');
  console.log(`   ${railwayUrl}\n`);
  console.log('2. Select environments: Production, Preview');
  console.log('3. Click Save');
  console.log('4. Redeploy: Deployments → Redeploy latest');
  console.log('5. Test: Visit https://oliofly.com/api/test-db\n');

  console.log('🎉 Import process complete!\n');
  rl.close();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

