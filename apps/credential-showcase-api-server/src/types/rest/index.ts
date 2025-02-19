import {CredentialAttributeType} from '../schema';

// TODO replace all these types with the models from the openapi spec

export type CredentialAttribute = {
    id: string
    name : string
    value : string
    type?: CredentialAttributeType
}

export type RevocationInfo = {
    id: string
    title: string
    description: string
}

export type CredentialRepresentation = {
    id: string
}

export enum RelyingPartyType {
    ARIES = "ARIES",
}
