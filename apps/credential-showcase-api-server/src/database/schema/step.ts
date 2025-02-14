import { relations } from 'drizzle-orm';
import { pgTable, integer, varchar, uuid } from 'drizzle-orm/pg-core';
import { StepTypePg } from './stepType';
import { workflows } from './workflow';
import { stepActions } from './stepAction';
import { assets } from './asset';

export const steps = pgTable('step', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    order: integer().notNull(), // TODO we should make this unique?
    type: StepTypePg('step_type').notNull(),
    //subFlow: uuid('sub_flow').references(() => workflows.id),
    workflow: uuid().references(() => workflows.id,{ onDelete: 'cascade' }).notNull(),
    image: uuid().references(() => assets.id).notNull(), // TODO or named asset?
});

export const stepRelations = relations(steps, ({ one, many }) => ({
    // subFlow: one(workflows, {
    //     fields: [steps.subFlow],
    //     references: [workflows.id],
    // }),
    actions: many(stepActions),
    workflow: one(workflows, {
        fields: [steps.workflow],
        references: [workflows.id],
    }),
    image: one(assets, {
        fields: [steps.image],
        references: [assets.id],
    }),
}));
