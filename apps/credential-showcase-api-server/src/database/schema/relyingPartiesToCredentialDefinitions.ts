import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { relyingParties } from './relyingParty';
import { credentialDefinitions } from './credentialDefinition';

export const relyingPartiesToCredentialDefinitions = pgTable('relyingPartiesToCredentialDefinitions', {
        relyingParty: uuid('relying_party_id').references(() => relyingParties.id, { onDelete: 'cascade' }).notNull(), //relyingPartyId
        credentialDefinition: uuid('credential_definition_id').references(() => credentialDefinitions.id, { onDelete: 'cascade' }).notNull(), //credentialDefinitionId
    },
    (t) => [
        primaryKey({ columns: [t.relyingParty, t.credentialDefinition] })
    ],
);

export const relyingPartiesToCredentialDefinitionsRelations = relations(relyingPartiesToCredentialDefinitions, ({ one }) => ({
    cd: one(credentialDefinitions, { //credentialDefinition
        fields: [relyingPartiesToCredentialDefinitions.credentialDefinition],
        references: [credentialDefinitions.id],
    }),
    rp: one(relyingParties, { //relyingParty
        fields: [relyingPartiesToCredentialDefinitions.relyingParty],
        references: [relyingParties.id],
    }),
}));
