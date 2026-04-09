"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const greeting_entity_1 = require("./entities/greeting.entity");
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
    const ds = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'db',
        entities: [greeting_entity_1.Greeting],
    });
    await ds.initialize();
    const repo = ds.getRepository(greeting_entity_1.Greeting);
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
//# sourceMappingURL=seed.js.map