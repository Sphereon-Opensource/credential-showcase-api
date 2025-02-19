import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { credentialDefinitions } from './credentialDefinition';

export const credentialRepresentations = pgTable('credentialRepresentation', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    credentialDefinition: uuid('credential_definition').references(() => credentialDefinitions.id, { onDelete: 'cascade' }).notNull()
});

export const credentialRepresentationRelations = relations(credentialRepresentations, ({ one }) => ({
    credentialDefinition: one(credentialDefinitions, {
        fields: [credentialRepresentations.credentialDefinition],
        references: [credentialDefinitions.id],
    }),
}));
