import { relations } from 'drizzle-orm';
import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { stepActions } from './stepAction';

export const ariesProofRequests = pgTable('ariesProofRequest', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),


    stepAction: uuid('step_action').references(() => stepActions.id, { onDelete: 'cascade' }).notNull().unique()
});

export const ariesProofRequestRelations = relations(ariesProofRequests, ({ one }) => ({
    stepAction: one(stepActions, {
        fields: [ariesProofRequests.stepAction],
        references: [stepActions.id],
    }),
}));
