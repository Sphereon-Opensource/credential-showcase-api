import { pgTable, uuid, varchar, pgEnum, check } from 'drizzle-orm/pg-core'
import { steps } from './step'
import { relations, sql } from 'drizzle-orm'
import { ariesProofRequests } from './ariesProofRequest'

export const StepActionTypePg = pgEnum(
  'StepActionType',
  Object.values({
    ARIES_OOB: 'ARIES_OOB',
  }) as [string, ...string[]],
)

export const stepActions = pgTable(
  'stepAction',
  {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    type: StepActionTypePg('type').notNull(),
    title: varchar({ length: 255 }).notNull(),
    text: varchar({ length: 255 }).notNull(),
    step: uuid()
      .references(() => steps.id, { onDelete: 'cascade' })
      .notNull(),
    proofRequest: uuid()
      .references(() => ariesProofRequests.id),
  },
  () => [
    check(
      'type_check',
      sql`
            type IN ('ARIES_OOB')
        `,
    ),
  ],
)

export const stepActionRelations = relations(stepActions, ({ one }) => ({
  step: one(steps, {
    fields: [stepActions.step],
    references: [steps.id],
  }),
  proofRequest: one(ariesProofRequests),
}))
