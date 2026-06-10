import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DB_URL, ssl: { rejectUnauthorized: false } });
try {
  console.log('connected');
  const r1 = await pool.query('SELECT 1 AS v');
  console.log('r1', r1.rows);
  const r2 = await pool.query('SELECT role_id FROM roles WHERE role_name=$1', ['user']);
  console.log('r2', r2.rows);
  const email = 'testuser_' + Date.now() + '@example.com';
  const name = 'Test User';
  const password_hash = 'fakehash';
  const query = 'INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name=$4)) RETURNING user_id';
  const res = await pool.query(query, [name, email, password_hash, 'user']);
  console.log('insert', res.rows);
} catch (err) {
  console.error('ERR', err);
} finally {
  await pool.end();
}
