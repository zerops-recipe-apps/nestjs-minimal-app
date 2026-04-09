import { DataSource } from 'typeorm';
import { Greeting } from './entities/greeting.entity.js';

const GREETINGS = [
  { message: 'Hello, World!', language: 'English' },
  { message: 'Ahoj, svete!', language: 'Czech' },
  { message: 'Bonjour le monde!', language: 'French' },
  { message: 'Hola, Mundo!', language: 'Spanish' },
  { message: 'Hallo, Welt!', language: 'German' },
  { message: 'Ciao, Mondo!', language: 'Italian' },
  { message: 'Ola, Mundo!', language: 'Portuguese' },
  { message: 'Hej, Verden!', language: 'Danish' },
  { message: 'Hei, Maailma!', language: 'Finnish' },
  { message: 'Hallo, Wereld!', language: 'Dutch' },
  { message: 'Merhaba, Dunya!', language: 'Turkish' },
  { message: 'Witaj, Swiecie!', language: 'Polish' },
  { message: 'Privet, Mir!', language: 'Russian' },
  { message: 'Konnichiwa, Sekai!', language: 'Japanese' },
  { message: 'Annyeonghaseyo, Sesang!', language: 'Korean' },
  { message: 'Namaste, Duniya!', language: 'Hindi' },
  { message: 'Szia, Vilag!', language: 'Hungarian' },
  { message: 'Saluton, Mondo!', language: 'Esperanto' },
  { message: 'Hej, Varlden!', language: 'Swedish' },
  { message: 'Salut, Lume!', language: 'Romanian' },
];

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'db',
    entities: [Greeting],
  });

  await ds.initialize();

  const repo = ds.getRepository(Greeting);
  const count = await repo.count();
  if (count > 0) {
    console.log(`Seed skipped — ${count} greetings already exist`);
    await ds.destroy();
    return;
  }

  await repo.save(GREETINGS.map((g) => repo.create(g)));
  console.log(`Seeded ${GREETINGS.length} greetings`);
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
