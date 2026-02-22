const { sql, poolPromise } = require('./config/db');

async function migrate() {
    try {
        const pool = await poolPromise;
        console.log('Migrating HousekeepingTasks...');

        // Add CreatedAt column
        await pool.request().query('ALTER TABLE HousekeepingTasks ADD CreatedAt DATETIME DEFAULT GETDATE()');
        console.log('Added CreatedAt column.');

        // Fix status constraint
        // First drop old constraint
        await pool.request().query('ALTER TABLE HousekeepingTasks DROP CONSTRAINT CK_TaskStatus');
        console.log('Dropped old constraint.');

        // Add new constraint
        await pool.request().query("ALTER TABLE HousekeepingTasks ADD CONSTRAINT CK_TaskStatus CHECK (Status IN ('Pending','In Progress','Completed'))");
        console.log('Added new constraint.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
