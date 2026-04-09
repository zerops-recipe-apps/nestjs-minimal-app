import { DataSource } from 'typeorm';
import { Greeting } from './entities/greeting.entity';

async function migrate() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'db',
    entities: [Greeting],
    synchronize: true,
  });

  await ds.initialize();
  console.log('Migration complete — schema synchronized');
  await ds.destroy();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
