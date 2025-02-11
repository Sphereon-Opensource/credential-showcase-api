import { PgTableWithColumns } from 'drizzle-orm/pg-core';
import { createBaseWorkflowTable } from './baseWorkflow';

export const issuanceFlows: PgTableWithColumns<any> = createBaseWorkflowTable('issuanceFlow', {
    // TODO add issuer
}).table;
