const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const { Pool } = pg;

module.exports = {
  // Required for commands like `db push` and `migrate`
  datasource: {
    url: process.env.DIRECT_URL,
  },
  // Used at runtime by the Prisma Client
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
};
