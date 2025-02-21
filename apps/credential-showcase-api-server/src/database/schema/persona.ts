import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { assets } from './asset'

export const personas = pgTable("persona", {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  headshotImageId: uuid("headshot_image_id").references(() => assets.id),
  bodyImageId: uuid("body_image_id").references(() => assets.id),
});
