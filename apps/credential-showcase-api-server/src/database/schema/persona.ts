import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { assets } from './asset'
import { relations } from 'drizzle-orm';

export const personas = pgTable("persona", {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  headshotImage: uuid("headshot_image").references(() => assets.id),
  bodyImage: uuid("body_image").references(() => assets.id),
});

export const personaRelations = relations(personas, ({ one }) => ({
  headshotImage: one(assets, {
    fields: [personas.headshotImage],
    references: [assets.id],
  }),
  bodyImage: one(assets, {
    fields: [personas.bodyImage],
    references: [assets.id],
  }),
}));
  