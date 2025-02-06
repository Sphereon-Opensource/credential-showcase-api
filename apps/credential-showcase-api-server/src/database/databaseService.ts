import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import Container from 'typedi';
const path = require('path');

export const getDbConnection = async (): Promise<NodePgDatabase> => {
    const dbUrl = process.env.DB_URL ?? `postgresql://${process.env.DB_USERNAME}${process.env.DB_PASSWORD && `:${process.env.DB_PASSWORD}`}${process.env.DB_HOST && `@${process.env.DB_HOST}`}${process.env.DB_PORT && `:${process.env.DB_PORT}`}/${process.env.DB_NAME}`;
    const pool = new Pool({
        connectionString: dbUrl,
    });

    const db = drizzle({ client: pool });
    const migrationsFolder = path.resolve(__dirname, './migrations'); // TODO figure out the relative path
    await migrate(db, { migrationsFolder: migrationsFolder })

    Container.set("database", db);

    return db
}

// getDbConnection().then((db) => {
//     Container.set("database", db);
// });

// export const dbConnection = getDbConnection()
