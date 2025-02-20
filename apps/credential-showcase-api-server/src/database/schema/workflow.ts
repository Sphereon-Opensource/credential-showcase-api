import { relations, sql } from 'drizzle-orm';
import { pgTable, varchar, uuid, check } from 'drizzle-orm/pg-core';
import { steps } from './step';
import { issuers } from './issuer';
import { relyingParties } from './relyingParty';
import { WorkflowTypePg } from './workflowType';
import { WorkflowType } from '../../types';

export const workflows = pgTable('workflow', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    workflowType: WorkflowTypePg('workflow_type').notNull().$type<WorkflowType>(),
    issuer: uuid().references(() => issuers.id),
    relyingParty: uuid('relying_party').references(() => relyingParties.id)
    },
    () => [
        check('workflow_type_check', sql`
            (workflow_type = 'PRESENTATION' AND relying_party IS NOT NULL) OR
            (workflow_type = 'ISSUANCE' AND issuer IS NOT NULL)
        `)
    ]
)

export const workflowRelations = relations(workflows, ({ one, many }) => ({
    //personas: many(personas), // TODO implement personas from SHOWCASE-37
    steps: many(steps),
    issuer: one(issuers, {
        fields: [workflows.issuer],
        references: [issuers.id],
    }),
    relyingParty: one(relyingParties, {
        fields: [workflows.issuer],
        references: [relyingParties.id],
    }),
}));
