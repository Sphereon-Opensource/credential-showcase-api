import { PgTableWithColumns } from 'drizzle-orm/pg-core';
import { createBaseWorkflowTable } from './baseWorkflow';

export const presentationFlows: PgTableWithColumns<any> = createBaseWorkflowTable('presentationFlow', {
    // TODO add relying party
}).table;
