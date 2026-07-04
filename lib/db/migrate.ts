import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Erro: DATABASE_URL não está definida nas variáveis de ambiente.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    max: 1,
  });

  const db = drizzle(pool);

  console.log('Iniciando execução das migrations no Supabase...');
  
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations executadas com sucesso!');
  } catch (error) {
    console.error('Erro ao executar as migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigration();
