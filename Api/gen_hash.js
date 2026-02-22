const bcrypt = require('bcryptjs');
const pass = '123456';
bcrypt.hash(pass, 10, (err, hash) => {
    console.log('New Hash:', hash);
});
