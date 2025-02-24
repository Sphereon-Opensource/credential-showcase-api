import { relations } from 'drizzle-orm';
import { pgTable, integer, text, uuid } from 'drizzle-orm/pg-core';
import { StepTypePg } from './stepType';
import { workflows } from './workflow';
import { stepActions } from './stepAction';
import { assets } from './asset';
import { StepType } from '../../types';

export const steps = pgTable('step', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    title: text().notNull(),
    description: text().notNull(),
    order: integer().notNull(),
    type: StepTypePg('step_type').notNull().$type<StepType>(),
    subFlow: uuid('sub_flow').references(() => workflows.id),
    workflowId: uuid('workflow_id').references(() => workflows.id,{ onDelete: 'cascade' }).notNull(),
    asset: uuid().references(() => assets.id),
});

export const stepRelations = relations(steps, ({ one, many }) => ({
    subFlow: one(workflows, {
        fields: [steps.subFlow],
        references: [workflows.id],
    }),
    actions: many(stepActions),
    workflow: one(workflows, {
        fields: [steps.workflowId],
        references: [workflows.id],
    }),
    image: one(assets, {
        fields: [steps.asset],
        references: [assets.id],
    }),
}));
