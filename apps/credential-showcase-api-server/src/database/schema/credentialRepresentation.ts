import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { credentialDefinitions } from './credentialDefinition';

export const credentialRepresentations = pgTable('credentialRepresentation', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    credentialDefinitionId: uuid('credential_definition_id').references(() => credentialDefinitions.id).notNull()
});
