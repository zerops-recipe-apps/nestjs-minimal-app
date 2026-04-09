"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const greeting_entity_1 = require("./entities/greeting.entity");
async function migrate() {
    const ds = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'db',
        entities: [greeting_entity_1.Greeting],
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
//# sourceMappingURL=migrate.js.map