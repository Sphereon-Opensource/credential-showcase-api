import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';
import { customBytea } from '../customTypes/pg';
import { relations } from 'drizzle-orm';
import { personas } from './persona';

export const assets = pgTable('asset', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    mediaType: varchar('media_type', { length: 255 }).notNull(),
    fileName: varchar('file_name', { length: 255 }),
    description: varchar({ length: 255 }),
    content: customBytea().notNull()
});

export const assetRelations = relations(assets, ({ many }) => ({
    personas: many(personas),
}));
