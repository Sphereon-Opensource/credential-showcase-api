import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { steps } from './step';
import { relations } from 'drizzle-orm';

// TODO this needs to become a base entity
export const stepActions = pgTable('stepAction', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    actionType: text().notNull(),
    title: text().notNull(),
    text: text().notNull(),
    step: uuid().references(() => steps.id,{ onDelete: 'cascade' }).notNull()
});

export const stepActionRelations = relations(stepActions, ({ one }) => ({
    step: one(steps, {
        fields: [stepActions.step],
        references: [steps.id],
    }),
}));
