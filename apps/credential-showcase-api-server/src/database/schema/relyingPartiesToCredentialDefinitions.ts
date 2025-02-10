import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { relyingParties } from './relyingParty';
import { credentialDefinitions } from './credentialDefinition';

export const relyingPartiesToCredentialDefinitions = pgTable('relyingPartiesToCredentialDefinitions', {
        relyingPartyId: uuid('relying_party_id').references(() => relyingParties.id).notNull(),
        credentialDefinitionId: uuid('credential_definition_id').references(() => credentialDefinitions.id).notNull(),
    },
    (t) => [
        primaryKey({ columns: [t.relyingPartyId, t.credentialDefinitionId] })
    ],
);

export const relyingPartiesToCredentialDefinitionsRelations = relations(relyingPartiesToCredentialDefinitions, ({ one }) => ({
    credentialDefinition: one(credentialDefinitions, {
        fields: [relyingPartiesToCredentialDefinitions.credentialDefinitionId],
        references: [credentialDefinitions.id],
    }),
    relyingParty: one(relyingParties, {
        fields: [relyingPartiesToCredentialDefinitions.relyingPartyId],
        references: [relyingParties.id],
    }),
}));
