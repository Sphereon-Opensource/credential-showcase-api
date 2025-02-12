import { relations } from 'drizzle-orm';
import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';
import { steps } from './step';
import { WorkflowTypePg } from './workflowType';

export const workflows = pgTable('workflow', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    workflowType: WorkflowTypePg('workflow_type').notNull()
})

export const workflowRelations = relations(workflows, ({ one, many }) => ({
    //personas: many(personas), // TODO implement personas from SHOWCASE-37
    steps: many(steps)
    // TODO add issuer
    // TODO add relying party
}));
