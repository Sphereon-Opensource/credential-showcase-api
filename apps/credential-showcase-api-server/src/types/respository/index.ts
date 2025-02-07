import { Asset, NewAsset, CredentialDefinition, NewCredentialDefinition } from '../schema';

export type AssetRepositoryDefinition = {
    findById(id: string): Promise<Asset>;
    findAll(): Promise<Asset[]>;
    create(asset: NewAsset): Promise<Asset>;
    update(id: string, asset: Asset): Promise<Asset>;
    delete(id: string): Promise<void>;
}

export type CredentialDefinitionRepositoryDefinition = {
    findById(id: string): Promise<CredentialDefinition>;
    findAll(): Promise<CredentialDefinition[]>;
    create(credentialDefinition: NewCredentialDefinition): Promise<CredentialDefinition>;
    update(id: string, credentialDefinition: CredentialDefinition): Promise<CredentialDefinition>;
    delete(id: string): Promise<void>;
}
