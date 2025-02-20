import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { steps } from './step';
import { relations } from 'drizzle-orm';

// TODO this needs to become a base entity
export const stepActions = pgTable('stepAction', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    type: varchar({ length: 255 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    text: varchar({ length: 255 }).notNull(),
    step: uuid().references(() => steps.id,{ onDelete: 'cascade' }).notNull()
});

export const stepActionRelations = relations(stepActions, ({ one }) => ({
    credentialDefinition: one(steps, {
        fields: [stepActions.step],
        references: [steps.id],
    }),
}));
