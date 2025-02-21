import { AriesProofRequest } from 'credential-showcase-openapi';
import { relations } from 'drizzle-orm';
import { pgTable, jsonb, uuid } from 'drizzle-orm/pg-core';
import { stepActions } from './stepAction';

export const ariesProofRequests = pgTable('ariesProofRequests', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    proofRequest: jsonb('proofRequest').$type<AriesProofRequest>(),
});

export const ariesProofRequestRelations = relations(ariesProofRequests, ({ one }) => ({
    stepAction: one(stepActions, {
        fields: [ariesProofRequests.proofRequest],
        references: [stepActions.id],
    }),
}));  