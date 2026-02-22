const bcrypt = require('bcryptjs');
const hash = '$2b$10$9hV0K2zKjzvQ6dLZlB6x8O0G4Z9uFjH7M5y2YzH3A1K8sX0q1P7kW';
const pass = '123456';

bcrypt.compare(pass, hash, (err, res) => {
    console.log('Match:', res);
    console.log('Error:', err);
});
