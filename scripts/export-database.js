#!/usr/bin/env node

/**
 * Database Export Script (Node.js version)
 * Exports MySQL database to SQL file for phpMyAdmin import
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('\n=== Database Export Script ===\n');

  // Read .env file to get database name
  let dbName = 'property_portal';
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL="?mysql:\/\/[^:]+:[^@]+@[^:]+:\d+\/([^?]+)/);
    if (dbUrlMatch) {
      dbName = dbUrlMatch[1];
    }
  } catch (err) {
    console.log('⚠️  .env file not found, using default database name\n');
  }

  // Get credentials
  const dbUser = await question(`MySQL username (default: root): `) || 'root';
  const dbPassword = await question('MySQL password: ');
  
  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const exportFile = `property_portal_export_${timestamp}.sql`;

  console.log(`\n📦 Exporting database: ${dbName}`);
  console.log(`📄 Output file: ${exportFile}\n`);

  try {
    // Export using mysqldump
    const command = `mysqldump -u ${dbUser} -p${dbPassword} --single-transaction --routines --triggers --default-character-set=utf8mb4 ${dbName}`;
    
    const sqlDump = execSync(command, { encoding: 'utf8' });
    
    // Write to file
    fs.writeFileSync(exportFile, sqlDump);
    
    // Get file size
    const stats = fs.statSync(exportFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✅ Export successful!');
    console.log(`📁 File: ${exportFile}`);
    console.log(`📊 Size: ${fileSizeMB} MB\n`);
    
    console.log('📋 Next steps:');
    console.log('1. Upload', exportFile, 'to Hostinger');
    console.log('2. Open phpMyAdmin');
    console.log('3. Select your database');
    console.log('4. Go to Import tab');
    console.log('5. Choose', exportFile);
    console.log('6. Click Import\n');
    
    console.log('⚠️  Security Note: This file contains database data. Keep it secure!');
    
  } catch (error) {
    console.error('\n❌ Export failed!');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('- Database name is correct');
    console.error('- Username and password are correct');
    console.error('- MySQL is running');
    console.error('- User has proper privileges');
    console.error('- mysqldump command is available');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();

