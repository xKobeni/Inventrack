import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

const setupDatabase = async () => {
    try {
        // Connect to the database
        const client = await pool.connect();
        
        // Execute the schema SQL
        await client.query(schema);
        
        console.log('✅ Database setup completed successfully.');
        
        // Release the client back to the pool
        client.release();
        
        // Exit the process with a success code
        process.exit(0);
    } catch (error) {
        console.error('❌Error setting up the database:', error);
        process.exit(1); // Exit the process with an error code
    }
};

// Call the setup function
setupDatabase();

export default setupDatabase;

// to run the database setup: --> npm run db:init