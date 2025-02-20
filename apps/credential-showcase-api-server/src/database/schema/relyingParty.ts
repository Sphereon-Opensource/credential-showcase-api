import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { RelyingPartyTypePg } from './relyingPartyType';
import { assets } from './asset';
import { relyingPartiesToCredentialDefinitions } from './relyingPartiesToCredentialDefinitions';
import { RelyingPartyType } from '../../types';

export const relyingParties = pgTable('relyingParty', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    type: RelyingPartyTypePg('relying_party_type').notNull().$type<RelyingPartyType>(),
    description: varchar({ length: 255 }).notNull(),
    organization: varchar({ length: 255 }),
    logo: uuid().references(() => assets.id)
});

export const relyingPartyRelations = relations(relyingParties, ({ one, many }) => ({
    credentialDefinitions: many(relyingPartiesToCredentialDefinitions),
    logo: one(assets, {
        fields: [relyingParties.logo],
        references: [assets.id],
    })
}));
