require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.ACCESS_TOKEN_SECRET || 'your_jwt_secret',
  db: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 3306,
    name: process.env.DATABASE || 'your_db_name',
    user: process.env.DATABASE_USER || 'your_db_user',
    password: process.env.DATABASE_PASSWORD || 'your_db_password',
    dialect: process.env.DATABASE_DIALECT || 'mysql', // or 'postgres', 'mongodb', etc.
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
  },
  api: {
    prefix: process.env.API_PREFIX || '/api/v1',
  },
};

module.exports = config;
