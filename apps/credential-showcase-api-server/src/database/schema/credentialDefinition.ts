import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';
import { assets } from './asset';
import { CredentialTypePg } from './credentialType';
import { relations } from 'drizzle-orm';
import { credentialAttributes } from './credentialAttribute';

export const credentialDefinitions = pgTable('credentialDefinition', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    version: varchar({ length: 255 }).notNull(),
    icon: uuid().references(() => assets.id).notNull(),
    type: CredentialTypePg('credential_type').notNull(),
});

export const credentialDefinitionRelations = relations(credentialDefinitions, ({ many }) => ({
    attributes: many(credentialAttributes),
}));
