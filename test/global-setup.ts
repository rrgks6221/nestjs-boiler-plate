import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setupPostgresql() {
  const container = await new PostgreSqlContainer('postgres:16.1').start();

  process.env.DATABASE_URL = container.getConnectionUri();

  // Prisma migrations
  await execAsync('npx prisma migrate deploy');

  globalThis.__POSTGRES_CONTAINER__ = container;
}

module.exports = async function () {
  await Promise.all([setupPostgresql()]);
};
