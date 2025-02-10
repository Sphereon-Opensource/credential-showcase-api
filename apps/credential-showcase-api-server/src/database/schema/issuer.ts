import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { assets } from './asset'
import { pgSchema } from 'drizzle-orm/pg-core/schema'

export const issuerType = pgSchema('public').enum('IssuerType', ['ARIES'])

export const issuers = pgTable('issuer', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  type: issuerType('type').notNull(),
  organization: varchar('organization', { length: 255 }),
  logoId: uuid('logo_id').references(() => assets.id),
})
