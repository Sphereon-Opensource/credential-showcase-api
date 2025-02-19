import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';
import { customBytea } from '../customTypes/pg';

export const assets = pgTable('asset', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    mediaType: varchar('media_type', { length: 255 }).notNull(),
    fileName: varchar('file_name', { length: 255 }),
    description: varchar({ length: 255 }),
    content: customBytea().notNull()
});
