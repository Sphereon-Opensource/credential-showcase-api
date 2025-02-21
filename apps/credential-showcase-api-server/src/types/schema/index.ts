import {
    assets,
    personas,
    credentialAttributes,
    credentialDefinitions,
    credentialRepresentations,
    issuers,
    relyingParties,
    revocationInfo
} from '../../database/schema';

// $inferSelect does not respect nullability of fields and the type has every field as required
// $inferInsert only provides fields that are notNull() or generated by default. This seems to be a bug in DrizzleORM or very not pleasant choice

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert & { fileName?: string | null, description?: string | null };

export type Persona = typeof personas.$inferSelect & {
    headshotImage: Asset | null
    bodyImage: Asset | null
};
export type NewPersona = typeof personas.$inferInsert & { headshotImage?: string, bodyImage?: string };

export type CredentialDefinition = Omit<typeof credentialDefinitions.$inferSelect, 'icon' | 'type'> & {
    type: CredentialType
    icon: Asset
    attributes: CredentialAttribute[]
    representations: CredentialRepresentation[]
    revocation?: RevocationInfo | null
}
export type NewCredentialDefinition = Omit<typeof credentialDefinitions.$inferInsert, 'type'> & {
    type: CredentialType
    attributes: NewCredentialAttribute[]
    representations: NewCredentialRepresentation[]
    revocation?: NewRevocationInfo | null
}

export type CredentialAttribute = Omit<typeof credentialAttributes.$inferSelect, 'credentialDefinition'> & {
    type: CredentialAttributeType
};
export type NewCredentialAttribute = Omit<typeof credentialAttributes.$inferInsert, 'credentialDefinition'> & {
    type: CredentialAttributeType
}

export type CredentialRepresentation = Omit<typeof credentialRepresentations.$inferSelect, 'credentialDefinition'>;
export type NewCredentialRepresentation = Omit<typeof credentialRepresentations.$inferInsert, 'credentialDefinition'>

export type RevocationInfo = Omit<typeof revocationInfo.$inferSelect, 'credentialDefinition'>;
export type NewRevocationInfo = Omit<typeof revocationInfo.$inferInsert, 'credentialDefinition'>

export type RelyingParty = Omit<typeof relyingParties.$inferSelect, 'logo'> & {
    credentialDefinitions: CredentialDefinition[]
    logo: Asset | null
};
export type NewRelyingParty = Omit<typeof relyingParties.$inferInsert, 'logo'> & {
    credentialDefinitions: string[]
    organization?: string | null
    logo?: string | null
};

export type Issuer = Omit<typeof issuers.$inferSelect, 'logo'> & {
    credentialDefinitions: CredentialDefinition[]
    logo: Asset | null
};
export type NewIssuer = Omit<typeof issuers.$inferInsert, 'logo'> & {
    credentialDefinitions: string[]
    organization?: string | null
    logo?: string | null
};

export enum CredentialType {
    ANONCRED = 'ANONCRED',
}

export enum CredentialAttributeType {
    STRING = 'STRING',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
}

export enum RelyingPartyType {
    ARIES = 'ARIES',
}

export enum IssuerType {
    ARIES = 'ARIES',
}

export enum StepType {
    HUMAN_TASK = 'HUMAN_TASK',
    SERVICE = 'SERVICE',
    WORKFLOW = 'WORKFLOW',
}

export enum WorkflowType {
    ISSUANCE = 'ISSUANCE',
    PRESENTATION = 'PRESENTATION',
}

