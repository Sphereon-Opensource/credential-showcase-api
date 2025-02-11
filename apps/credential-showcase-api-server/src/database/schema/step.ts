import { relations } from 'drizzle-orm';
import { pgTable, integer, varchar, uuid } from 'drizzle-orm/pg-core';
import { StepTypePg } from './stepType';
import { issuanceFlows } from './issuanceFlow';
import { presentationFlows } from './presentationFlow';
import { stepActions } from './stepAction';

export const steps = pgTable('step', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    order: integer().notNull(),
    type: StepTypePg('step_type').notNull(),
    subIssuanceFlow: uuid('sub_issuance_flow').references(() => issuanceFlows.id).notNull(),
    subPresentationFlow: uuid('sub_presentation_flow').references(() => presentationFlows.id).notNull(),
    issuanceFlowId: uuid('issuance_flow_id').references(() => issuanceFlows.id,{ onDelete: 'cascade' }),
    presentationFlowId: uuid('presentation_flow_id').references(() => presentationFlows.id,{ onDelete: 'cascade' }),
});

export const stepRelations = relations(steps, ({ one, many }) => ({
    subIssuanceFlow: one(issuanceFlows, {
        fields: [steps.subIssuanceFlow],
        references: [issuanceFlows.id],
    }),
    subPresentationFlow: one(presentationFlows, {
        fields: [steps.subPresentationFlow],
        references: [presentationFlows.id],
    }),
    actions: many(stepActions),
    issuanceFlow: one(issuanceFlows, {
        fields: [steps.issuanceFlowId],
        references: [issuanceFlows.id],
    }),
    presentationFlow: one(presentationFlows, {
        fields: [steps.presentationFlowId],
        references: [presentationFlows.id],
    }),
}));
