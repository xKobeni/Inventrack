import Pool from 'pg-pool';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;