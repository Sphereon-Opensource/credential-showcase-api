import type { BuildQueryResult, DBQueryConfig, ExtractTablesWithRelations } from 'drizzle-orm';
import * as schema from '../../database/schema';
import {
    assets,
    credentialAttributes,
    credentialDefinitions,
    credentialRepresentations,
    revocationInfo
} from '../../database/schema';
import {CredentialAttributeType} from '../rest';

type Schema = typeof schema;
type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
    'one' | 'many',
    boolean,
    TSchema,
    TSchema[TableName]
>['with'];

export type InferResultType<
    TableName extends keyof TSchema,
    With extends IncludeRelation<TableName> | undefined = undefined
> = BuildQueryResult<
    TSchema,
    TSchema[TableName],
    {
        with: With;
    }
>;

// $inferSelect does not respect nullability of fields and the type has every field as required
// $inferInsert only provides fields that are notNull() or generated by default. This seems to be a bug in DrizzleORM or very not pleasant choice

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert & { fileName?: string, description?: string };

// export type CredentialDefinition = InferResultType<'assets', {}>
// export type CredentialDefinition = InferResultType<'credentialDefinitions', { icon: true, attributes: true, representations: true, revocation: true }>

export type CredentialDefinition = Omit<typeof credentialDefinitions.$inferSelect, 'icon'> & {
    icon: Asset
    attributes: CredentialAttribute[]
    representations: CredentialRepresentation[]
    revocation: RevocationInfo | null
}

export type NewCredentialDefinition = Omit<typeof credentialDefinitions.$inferInsert, 'icon'> & {
    icon: NewAsset | string
    attributes: NewCredentialAttribute[]
    representations: NewCredentialRepresentation[]
    revocation?: NewRevocationInfo
}

export type CredentialAttribute = Omit<typeof credentialAttributes.$inferSelect, 'credentialDefinitionId'>;
export type NewCredentialAttribute = Omit<typeof credentialAttributes.$inferInsert, 'credentialDefinitionId'> & { type?: CredentialAttributeType }

export type CredentialRepresentation = Omit<typeof credentialRepresentations.$inferSelect, 'credentialDefinitionId'>;
export type NewCredentialRepresentation = Omit<typeof credentialRepresentations.$inferInsert, 'credentialDefinitionId'>

export type RevocationInfo = Omit<typeof revocationInfo.$inferSelect, 'credentialDefinitionId'>;
export type NewRevocationInfo = Omit<typeof revocationInfo.$inferInsert, 'credentialDefinitionId'>
