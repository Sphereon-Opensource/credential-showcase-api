import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Asset, NewAsset, NewPersona, Persona } from '../schema'

export type AssetRepositoryDefinition = {
    findById(assetId: string): Promise<Asset>;
    findAll(): Promise<Asset[]>;
    create(asset: NewAsset): Promise<Asset>;
    update(id: string, asset: Asset): Promise<Asset>;
    delete(assetId: string): Promise<void>;
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
