import { relations } from 'drizzle-orm';
import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';
import { steps } from './step';

export function createBaseWorkflowTable<T extends Record<string, any>>(
    tableName: string,
    fields: T
) {
    const table = pgTable(tableName, {
        id: uuid('id').notNull().primaryKey().defaultRandom(),
        name: varchar({ length: 255 }).notNull(),
        description: varchar({ length: 255 }).notNull(),
        ...fields,
    })

    return {
        table,
        relations: relations(table, ({ many }) => ({
            steps: many(steps),
        }))
    };
}
