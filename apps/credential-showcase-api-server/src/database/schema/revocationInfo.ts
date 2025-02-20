import {pgTable, uuid, varchar} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { credentialDefinitions } from './credentialDefinition';

export const revocationInfo = pgTable('revocationInfo', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    credentialDefinition: uuid('credential_definition').references(() => credentialDefinitions.id, { onDelete: 'cascade' }).notNull().unique()
});

export const revocationInfoRelations = relations(revocationInfo, ({ one }) => ({
    credentialDefinition: one(credentialDefinitions, {
        fields: [revocationInfo.credentialDefinition],
        references: [credentialDefinitions.id]
    }),
}));
