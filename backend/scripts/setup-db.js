const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres' // Connect to default database first
  });

  try {
    await client.connect();
    console.log('🔌 Connected to PostgreSQL');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'icosystem_dev';
    const dbCheckQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const dbExists = await client.query(dbCheckQuery, [dbName]);

    if (dbExists.rows.length === 0) {
      console.log(`📦 Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database already exists');
    }

    await client.end();
    console.log('🚀 Database setup completed!');
    
    // Now sync the models
    console.log('🔄 Synchronizing database models...');
    const { connectDB } = require('../src/config/database');
    await connectDB();
    console.log('✅ Models synchronized successfully');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n📝 Make sure PostgreSQL is running and credentials are correct');
    console.log('💡 Check your .env file configuration');
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;