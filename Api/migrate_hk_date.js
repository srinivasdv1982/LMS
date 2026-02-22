const { sql, poolPromise } = require('./config/db');

async function migrate() {
    try {
        const pool = await poolPromise;

        // Add TaskDate column
        console.log('Adding TaskDate column to HousekeepingTasks...');
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns 
                WHERE object_id = OBJECT_ID('HousekeepingTasks') 
                AND name = 'TaskDate'
            )
            BEGIN
                ALTER TABLE HousekeepingTasks ADD TaskDate DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE);
            END
        `);
        console.log('TaskDate column added or already exists.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
