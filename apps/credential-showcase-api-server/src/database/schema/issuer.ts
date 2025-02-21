import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { IssuerTypePg } from './issuerType';
import { assets } from './asset';
import { issuersToCredentialDefinitions } from './issuersToCredentialDefinitions';
import { IssuerType } from '../../types';

export const issuers = pgTable('issuer', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    type: IssuerTypePg('issuer_type').notNull().$type<IssuerType>(),
    description: varchar({ length: 255 }).notNull(),
    organization: varchar({ length: 255 }),
    logo: uuid().references(() => assets.id),
})

export const issuerRelations = relations(issuers, ({ one, many }) => ({
    credentialDefinitions: many(issuersToCredentialDefinitions),
    logo: one(assets, {
        fields: [issuers.logo],
        references: [assets.id],
    })
}));
