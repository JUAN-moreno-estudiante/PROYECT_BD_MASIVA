const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.uvimmvohyoejofoukrmo',
  password: 'OrWapz9hPHWI9On6',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL con Pool'))
  .catch(err => console.error('❌ Error al conectar:', err));

module.exports = pool;