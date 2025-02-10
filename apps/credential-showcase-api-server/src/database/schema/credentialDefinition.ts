import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';
import { assets } from './asset';
import { CredentialTypePg } from './credentialType';
import { relations } from 'drizzle-orm';
import { credentialAttributes } from './credentialAttribute';
import { credentialRepresentations } from './credentialRepresentation';
import { revocationInfo } from './revocationInfo';

export const credentialDefinitions = pgTable('credentialDefinition', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    version: varchar({ length: 255 }).notNull(),
    icon: uuid().references(() => assets.id).notNull(),
    type: CredentialTypePg('credential_type').notNull()
});

export const credentialDefinitionRelations = relations(credentialDefinitions, ({ one, many }) => ({
    icon: one(assets, {
        fields: [credentialDefinitions.icon],
        references: [assets.id],
    }),
    attributes: many(credentialAttributes),
    representations: many(credentialRepresentations),
    revocation: one(revocationInfo),
}));
