
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'society_management',
  user: 'postgres',
  password: 'your_password'
});

async function importData() {
  const files = fs.readdirSync('.').filter(f => f.endsWith('_export.json'));
  
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file));
    console.log(`Importing ${data.table}...`);
    
    for (const row of data.rows) {
      const columns = Object.keys(row);
      const values = Object.values(row);
      const placeholders = values.map((_, i) => `$${i + 1}`);
      
      const query = `INSERT INTO ${data.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) ON CONFLICT DO NOTHING`;
      
      try {
        await pool.query(query, values);
      } catch (err) {
        console.log(`Error inserting into ${data.table}:`, err.message);
      }
    }
  }
  
  pool.end();
  console.log('Import completed!');
}

importData();
