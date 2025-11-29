import { db } from '../src/db/client.js';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
    try {
        console.log('Running migrations...');

        // Read the migration file
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, '../src/db/migrations/0001_add_views_and_procedures.sql'),
            'utf-8'
        );

        // Split by DELIMITER and execute each statement
        const statements = migrationSQL
            .split(/DELIMITER\s+;/gi)
            .filter(s => s.trim());

        for (const statement of statements) {
            // Remove DELIMITER // declarations
            const cleanStatement = statement.replace(/DELIMITER\s+\/\//gi, '').trim();

            if (cleanStatement) {
                // Split by semicolons for regular statements
                const subStatements = cleanStatement.split(';').filter(s => s.trim());

                for (const subStatement of subStatements) {
                    if (subStatement.trim()) {
                        try {
                            await db.execute(sql.raw(subStatement));
                            console.log('✓ Executed statement');
                        } catch (err: any) {
                            // Ignore "already exists" errors
                            if (!err.message.includes('already exists')) {
                                console.error('Error executing statement:', err.message);
                            }
                        }
                    }
                }
            }
        }

        console.log('✓ Migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();
