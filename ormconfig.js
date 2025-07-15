const { join } = require('path');

module.exports = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'your_username',
  password: 'your_password',
  database: 'your_database',
  synchronize: false,
  logging: true,
  entities: [join(__dirname, 'dist', 'entity', '*.entity.js')],
  migrations: [join(__dirname, 'dist', 'migration', '*.js')],
  cli: {
    migrationsDir: 'src/migration',
  },
};
