import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { assets } from './asset'
import { pgSchema } from 'drizzle-orm/pg-core/schema'
import { relations } from 'drizzle-orm'

export const issuerType = pgSchema('public').enum('IssuerType', ['ARIES'])
export const credentialType = pgSchema('public').enum('CredentialType', ['ARIES'])
export const credentialAttributeType = pgSchema('public').enum('CredentialAttributeType', ['STRING', 'INTEGER', 'FLOAT', 'BOOLEAN', 'DATE'])

export const credentialDefinitionRevocation = pgTable('credential_definition_revocation', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  registryId: varchar('description', { length: 255 })
})

export const credentialRepresentation200ResponseInner = pgTable('credential_representation_200_response_inner', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  credDefId: varchar('credDefId', { length: 255 }),
  schemaId: varchar('credDefId', { length: 255 }),
  ocaBundleUrl: varchar('credDefId', { length: 255 }),
  credentialDefinitionId:  uuid('credential_definition_id').references(() => credentialDefinitions.id),
})

export const credentialAttributes = pgTable('credential_attributes', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }),
  type: credentialAttributeType('type').notNull(),
  credentialDefinitionId: uuid('credential_definition_id').references(() => credentialDefinitions.id),
})

export const credentialDefinitions = pgTable('credential_definition', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  version: varchar('version', { length: 255 }).notNull(),
  type: credentialType('type').notNull(),
  issuerId: uuid('issuer_id').references(() => issuers.id),
})

export const issuers = pgTable('issuer', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  type: issuerType('type').notNull(),
  organization: varchar('organization', { length: 255 }),
  logoId: uuid('logo_id').references(() => assets.id),
})

export const credentialRepresentation200ResponseInnerRelations = relations(credentialRepresentation200ResponseInner, ({ one }) => ({
  credentialDefinition: one(credentialDefinitions, {
    fields: [credentialRepresentation200ResponseInner.credentialDefinitionId],
    references: [credentialDefinitions.id],
  }),
}))

export const credentialAttributesRelations = relations(credentialAttributes, ({ one }) => ({
  credentialDefinition: one(credentialDefinitions, {
    fields: [credentialAttributes.credentialDefinitionId],
    references: [credentialDefinitions.id],
  }),
}))

export const credentialDefinitionRelations = relations(credentialDefinitions, ({ one, many }) => ({
  attributes: many(credentialAttributes),
  representations: many(credentialRepresentation200ResponseInner),
  issuer: one(issuers, {
    fields: [credentialDefinitions.issuerId],
    references: [issuers.id],
  }),
  revocation: one(credentialDefinitionRevocation, {
    fields: [credentialDefinitions.id],
    references: [credentialDefinitionRevocation.id],
  }),
  icon: one(assets, {
    fields: [credentialDefinitions.id],
    references: [assets.id],
  }),
}))

export const issuerRelations = relations(issuers, ({ one, many }) => ({
  credentialDefinitions: many(credentialDefinitions),
  logo: one(assets, {
    fields: [issuers.logoId],
    references: [assets.id],
  }),
}))
