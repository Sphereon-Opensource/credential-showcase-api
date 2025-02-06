const path = require('path');
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { Service } from 'typedi';

@Service()
export class DatabaseService {
    private db?: NodePgDatabase;

    private getDbUrl(): string {
        return (
            process.env.DB_URL ??
            `postgresql://${process.env.DB_USERNAME}${process.env.DB_PASSWORD && `:${process.env.DB_PASSWORD}`}${process.env.DB_HOST && `@${process.env.DB_HOST}`}${process.env.DB_PORT && `:${process.env.DB_PORT}`}/${process.env.DB_NAME}`
        );
    }

    public async getConnection(): Promise<NodePgDatabase> {
        if (!this.db) {
            const pool = new Pool({ connectionString: this.getDbUrl() });
            this.db = drizzle(pool);

            const migrationsFolder = path.resolve(__dirname, '../database/migrations');
            await migrate(this.db, { migrationsFolder });
        }

        return this.db;
    }
}
