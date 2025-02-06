import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Asset, NewAsset, NewPersona, Persona } from '../schema'

export type AssetRepositoryDefinition = {
    findById(assetId: string): Promise<Asset | null>;
    findAll(): Promise<Asset[]>;
    create(asset: NewAsset): Promise<Asset>;
    update(asset: Asset): Promise<Asset | null>;
    delete(assetId: string): Promise<boolean>;
}

export type AssetRepositoryArgs = {
    database: NodePgDatabase
}

export type PersonaRepositoryDefinition = {
    findById(personaId: string): Promise<Persona | null>;
    findAll(): Promise<Persona[]>;
    create(persona: NewPersona): Promise<Persona>;
    update(persona: Persona): Promise<Persona | null>;
    delete(personaId: string): Promise<boolean>;
}

export type PersonaRepositoryArgs = {
    database: NodePgDatabase
}
