import { relations } from 'drizzle-orm';
import { pgTable, integer, varchar, uuid } from 'drizzle-orm/pg-core';
import { StepTypePg } from './stepType';
import { workflows } from './workflow';
import { stepActions } from './stepAction';
import { assets } from './asset';
import { StepType } from '../../types';

export const steps = pgTable('step', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    order: integer().notNull(),
    type: StepTypePg('step_type').notNull().$type<StepType>(),
    subFlow: uuid('sub_flow').references(() => workflows.id),
    workflowId: uuid('workflow_id').references(() => workflows.id,{ onDelete: 'cascade' }).notNull(),
    image: uuid().references(() => assets.id).notNull(),
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
        fields: [steps.image],
        references: [assets.id],
    }),
}));
