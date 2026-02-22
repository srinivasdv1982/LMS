const { sql, poolPromise } = require('./config/db');

async function migrate_social() {
    try {
        const pool = await poolPromise;
        console.log('Creating Social Portal Tables...');

        // News Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'News')
            BEGIN
                CREATE TABLE News (
                    NewsId INT IDENTITY(1,1) PRIMARY KEY,
                    LodgeId INT NOT NULL,
                    Title NVARCHAR(255) NOT NULL,
                    Content NVARCHAR(MAX) NOT NULL,
                    ImageUrl NVARCHAR(500),
                    CreatedBy INT NOT NULL,
                    CreatedAt DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (LodgeId) REFERENCES Lodges(LodgeId),
                    FOREIGN KEY (CreatedBy) REFERENCES Employees(EmployeeId)
                );
                CREATE INDEX IX_News_LodgeId ON News(LodgeId);
                PRINT 'News table created.';
            END
        `);

        // Ads Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Ads')
            BEGIN
                CREATE TABLE Ads (
                    AdId INT IDENTITY(1,1) PRIMARY KEY,
                    LodgeId INT NOT NULL,
                    Title NVARCHAR(255) NOT NULL,
                    Link NVARCHAR(500),
                    ImageUrl NVARCHAR(500),
                    CreatedBy INT NOT NULL,
                    CreatedAt DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (LodgeId) REFERENCES Lodges(LodgeId),
                    FOREIGN KEY (CreatedBy) REFERENCES Employees(EmployeeId)
                );
                CREATE INDEX IX_Ads_LodgeId ON Ads(LodgeId);
                PRINT 'Ads table created.';
            END
        `);

        console.log('Social migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Social Migration failed:', err.message);
        process.exit(1);
    }
}

migrate_social();
