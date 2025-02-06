import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { integer } from 'drizzle-orm/pg-core/columns/integer'
import { assets } from './asset'

export const personas = pgTable("persona", {
  personaId: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  headshotImageId: integer("headshotImageId").references(() => assets.assetId),
  bodyImageId: integer("bodyImageId").references(() => assets.assetId),
});
