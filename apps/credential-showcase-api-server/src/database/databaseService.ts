import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

export const getDbConnection = async (): Promise<NodePgDatabase> => {
    const dbUrl = process.env.DB_URL ?? `postgresql://${process.env.DB_USERNAME}${process.env.DB_PASSWORD && `:${process.env.DB_PASSWORD}`}${process.env.DB_HOST && `@${process.env.DB_HOST}`}${process.env.DB_PORT && `:${process.env.DB_PORT}`}/${process.env.DB_NAME}`;
    const pool = new Pool({
        connectionString: dbUrl,
    });

    const db = drizzle({ client: pool });
    await migrate(db, { migrationsFolder: './migrations' })

    return db
}

export const dbConnection = getDbConnection()
