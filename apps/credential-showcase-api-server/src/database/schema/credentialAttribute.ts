import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { credentialDefinitions } from './credentialDefinition';
import { CredentialAttributeTypePg } from './credentialAttributeType';
import { CredentialAttributeType } from '../../types';

export const credentialAttributes = pgTable('credentialAttribute', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    value: varchar({ length: 255 }).notNull(),
    type: CredentialAttributeTypePg('credential_attribute_type').notNull().$type<CredentialAttributeType>(),
    credentialDefinition: uuid('credential_definition').references(() => credentialDefinitions.id,{ onDelete: 'cascade' }).notNull()
});

export const credentialAttributeRelations = relations(credentialAttributes, ({ one }) => ({
    credentialDefinition: one(credentialDefinitions, {
        fields: [credentialAttributes.credentialDefinition],
        references: [credentialDefinitions.id],
    }),
}));
