# Manual MySQL Password Reset Instructions

If the automated script doesn't work, follow these steps to reset MySQL root password:

## Method 1: Using MySQL Safe Mode (Recommended)

### Step 1: Stop MySQL
```bash
brew services stop mysql
```

### Step 2: Start MySQL in Safe Mode (Skip Grant Tables)
```bash
sudo /opt/homebrew/bin/mysqld_safe --skip-grant-tables --skip-networking &
```

Wait 5 seconds for MySQL to start.

### Step 3: Connect to MySQL (No Password Required)
```bash
mysql -u root
```

### Step 4: Reset Password
In the MySQL prompt, run:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'India@123';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5: Stop Safe Mode MySQL
```bash
sudo pkill mysqld
```

### Step 6: Start MySQL Normally
```bash
brew services start mysql
```

### Step 7: Test Connection
```bash
mysql -u root -pIndia@123 -e "SELECT 1;"
```

---

## Method 2: Using mysqladmin (If MySQL is Running)

```bash
mysqladmin -u root password 'India@123'
```

Or if you need to change existing password:
```bash
mysqladmin -u root -p'old_password' password 'India@123'
```

---

## Method 3: Using MySQL Config File

1. Stop MySQL: `brew services stop mysql`
2. Create/Edit: `/opt/homebrew/etc/my.cnf`
3. Add:
   ```ini
   [mysqld]
   skip-grant-tables
   ```
4. Start MySQL: `brew services start mysql`
5. Connect: `mysql -u root`
6. Run:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'India@123';
   FLUSH PRIVILEGES;
   EXIT;
   ```
7. Remove skip-grant-tables from config
8. Restart: `brew services restart mysql`

---

## After Password Reset

Once password is set to `India@123`, run:

```bash
./scripts/setup-local-mysql.sh
```

Or continue manually:
```bash
# Create database
mysql -u root -pIndia@123 -e "CREATE DATABASE property_portal;"

# Update .env
# DATABASE_URL="mysql://root:India@123@localhost:3306/property_portal"

# Run migrations
npx prisma generate
npx prisma migrate dev --name init
```

