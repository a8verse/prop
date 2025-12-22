#!/usr/bin/env node

/**
 * Migration Script: Hostinger MySQL → Railway MySQL
 * 
 * This script helps migrate your database from Hostinger to Railway
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 Railway Migration Script\n');
  console.log('This script will help you migrate from Hostinger to Railway MySQL\n');

  // Step 1: Get Railway connection details
  console.log('=== Step 1: Railway Database Connection ===\n');
  console.log('To get your Railway connection string:');
  console.log('1. Go to railway.app → Your Project → MySQL Service');
  console.log('2. Click "Connect" or "Variables" tab');
  console.log('3. Copy the connection string (MYSQL_URL or DATABASE_URL)\n');
  
  const railwayUrl = await question('Paste Railway MySQL connection string: ');
  
  if (!railwayUrl || !railwayUrl.includes('mysql://')) {
    console.error('❌ Invalid connection string. Must start with mysql://');
    process.exit(1);
  }

  // Step 2: Get Hostinger connection details
  console.log('\n=== Step 2: Hostinger Database Connection ===\n');
  const hostingerHost = await question('Hostinger MySQL host (e.g., auth-db1327.hstgr.io): ') || 'auth-db1327.hstgr.io';
  const hostingerUser = await question('Hostinger MySQL username: ') || 'u287945899_oliofy';
  const hostingerPassword = await question('Hostinger MySQL password: ');
  const hostingerDatabase = await question('Hostinger database name: ') || 'u287945899_oliofly';

  // Step 3: Export from Hostinger
  console.log('\n=== Step 3: Exporting from Hostinger ===\n');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const exportFile = `hostinger_export_${timestamp}.sql`;
  
  console.log('Exporting database...');
  try {
    // Use mysqldump to export
    const dumpCommand = `mysqldump -h ${hostingerHost} -u ${hostingerUser} -p${hostingerPassword} --single-transaction --routines --triggers --default-character-set=utf8mb4 ${hostingerDatabase}`;
    
    console.log('Running mysqldump...');
    const sqlDump = execSync(dumpCommand, { encoding: 'utf8', stdio: 'pipe' });
    
    // Write to file
    fs.writeFileSync(exportFile, sqlDump);
    const stats = fs.statSync(exportFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Export successful!`);
    console.log(`📁 File: ${exportFile}`);
    console.log(`📊 Size: ${fileSizeMB} MB\n`);
  } catch (error) {
    console.error('❌ Export failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Alternative: Export via phpMyAdmin:');
    console.error('1. Login to Hostinger phpMyAdmin');
    console.error('2. Select your database');
    console.error('3. Click "Export" tab');
    console.error('4. Choose "Quick" method');
    console.error('5. Click "Go" and save the file');
    console.error(`6. Save it as: ${exportFile}`);
    console.error('7. Place it in the project root directory');
    console.error('8. Run this script again and skip export step\n');
    
    const skipExport = await question('Skip export and use existing file? (y/n): ');
    if (skipExport.toLowerCase() !== 'y') {
      process.exit(1);
    }
    
    // Check if file exists
    if (!fs.existsSync(exportFile)) {
      console.error(`❌ File ${exportFile} not found!`);
      process.exit(1);
    }
  }

  // Step 4: Parse Railway connection string
  console.log('\n=== Step 4: Connecting to Railway ===\n');
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
    console.log('✅ Connection string parsed successfully');
    console.log(`   Host: ${railwayParsed.host}`);
    console.log(`   Database: ${railwayParsed.database}\n`);
  } catch (error) {
    console.error('❌ Failed to parse Railway connection string');
    console.error('Error:', error.message);
    process.exit(1);
  }

  // Step 5: Create tables in Railway using Prisma
  console.log('=== Step 5: Creating Tables in Railway ===\n');
  console.log('Setting up Railway database with Prisma schema...\n');
  
  // Temporarily update .env for Prisma
  const originalEnv = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
  const envBackup = '.env.backup';
  if (originalEnv) {
    fs.writeFileSync(envBackup, originalEnv);
  }
  
  // Update .env with Railway connection
  let newEnv = originalEnv;
  if (newEnv.includes('DATABASE_URL=')) {
    newEnv = newEnv.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${railwayUrl}"`);
  } else {
    newEnv += `\nDATABASE_URL="${railwayUrl}"\n`;
  }
  fs.writeFileSync('.env', newEnv);
  
  try {
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Tables created successfully!\n');
  } catch (error) {
    console.error('❌ Failed to create tables');
    console.error('Error:', error.message);
    // Restore .env
    if (fs.existsSync(envBackup)) {
      fs.writeFileSync('.env', fs.readFileSync(envBackup, 'utf8'));
      fs.unlinkSync(envBackup);
    }
    process.exit(1);
  }

  // Step 6: Import data to Railway
  console.log('=== Step 6: Importing Data to Railway ===\n');
  console.log('Importing SQL file to Railway...\n');
  
  try {
    const importCommand = `mysql -h ${railwayParsed.host} -P ${railwayParsed.port} -u ${railwayParsed.user} -p${railwayParsed.password} ${railwayParsed.database} < ${exportFile}`;
    execSync(importCommand, { stdio: 'inherit' });
    console.log('✅ Data imported successfully!\n');
  } catch (error) {
    console.error('❌ Import failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Alternative: Import via Railway web interface:');
    console.error('1. Go to railway.app → Your MySQL service');
    console.error('2. Use the web terminal or connect via MySQL client');
    console.error(`3. Import file: ${exportFile}\n`);
  }

  // Step 7: Test connection
  console.log('=== Step 7: Testing Connection ===\n');
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    const categories = await prisma.category.count();
    const properties = await prisma.property.count();
    const users = await prisma.user.count();
    
    console.log('✅ Connection successful!');
    console.log(`   Categories: ${categories}`);
    console.log(`   Properties: ${properties}`);
    console.log(`   Users: ${users}\n`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Connection test failed');
    console.error('Error:', error.message);
  }

  // Step 8: Instructions for Vercel
  console.log('=== Step 8: Update Vercel ===\n');
  console.log('✅ Migration complete! Now update Vercel:\n');
  console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('2. Find DATABASE_URL');
  console.log('3. Update it with this Railway connection string:');
  console.log(`   ${railwayUrl}\n`);
  console.log('4. Select environments: Production, Preview');
  console.log('5. Click Save');
  console.log('6. Go to Deployments → Redeploy latest deployment');
  console.log('7. Test: Visit https://oliofly.com/api/test-db\n');

  // Restore original .env
  if (fs.existsSync(envBackup)) {
    fs.writeFileSync('.env', fs.readFileSync(envBackup, 'utf8'));
    fs.unlinkSync(envBackup);
    console.log('✅ Restored original .env file\n');
  }

  // Cleanup
  const keepExport = await question(`Keep export file ${exportFile}? (y/n): `);
  if (keepExport.toLowerCase() !== 'y') {
    fs.unlinkSync(exportFile);
    console.log('✅ Export file deleted\n');
  }

  console.log('🎉 Migration process complete!\n');
  rl.close();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

