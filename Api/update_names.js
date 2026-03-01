const { poolPromise } = require('./config/db');

async function updateNames() {
    try {
        const pool = await poolPromise;
        const names = [
            { f: 'Rajesh', l: 'Kumar' }, { f: 'Anita', l: 'Sharma' },
            { f: 'Vikram', l: 'Singh' }, { f: 'Priya', l: 'Patel' },
            { f: 'Amit', l: 'Verma' }, { f: 'Sneha', l: 'Reddy' },
            { f: 'Sanjay', l: 'Gupta' }, { f: 'Pooja', l: 'Joshi' },
            { f: 'Rahul', l: 'Nair' }, { f: 'Neha', l: 'Mehta' }
        ];

        const emps = await pool.request().query("SELECT EmployeeId, FirstName FROM Employees");
        let updateCount = 0;

        for (let i = 0; i < emps.recordset.length; i++) {
            const emp = emps.recordset[i];
            if (emp.FirstName.includes('Staff') || emp.FirstName.includes('Employee')) {
                const name = names[updateCount % names.length];
                await pool.query('UPDATE Employees SET FirstName=?, LastName=? WHERE EmployeeId=?',
                    [name.f, name.l, emp.EmployeeId]
                );
                updateCount++;
            }
        }
        console.log(`Successfully updated ${updateCount} employee names.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateNames();
