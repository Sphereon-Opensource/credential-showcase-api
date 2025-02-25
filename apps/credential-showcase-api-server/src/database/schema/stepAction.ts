import { relations } from 'drizzle-orm';
import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { steps } from './step';
import { StepActionType } from '../../types';
import { ariesProofRequests } from './ariesProofRequest';

export const stepActions = pgTable('stepAction', {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    actionType: text().notNull().$type<StepActionType>(),
    title: text().notNull(),
    text: text().notNull(),
    step: uuid().references(() => steps.id, { onDelete: 'cascade' }).notNull()
  },
  // () => [
  //   check(
  //     'type_check',
  //     sql`
  //           type IN ('ARIES_OOB')
  //       `,
  //   ),
  // ],
)

export const stepActionRelations = relations(stepActions, ({ one }) => ({
    step: one(steps, {
        fields: [stepActions.step],
        references: [steps.id],
    }),
    proofRequest: one(ariesProofRequests)
}));
