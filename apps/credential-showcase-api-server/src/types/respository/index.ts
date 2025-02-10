import { Asset, NewAsset, NewPersona, Persona } from '../schema'

export type AssetRepositoryDefinition = {
    findById(id: string): Promise<Asset>;
    findAll(): Promise<Asset[]>;
    create(asset: NewAsset): Promise<Asset>;
    update(id: string, asset: Asset): Promise<Asset>;
    delete(id: string): Promise<void>;
}

export type PersonaRepositoryDefinition = {
    findById(id: string): Promise<Persona>;
    findAll(): Promise<Persona[]>;
    create(persona: NewPersona): Promise<Persona>;
    update(id: string, persona: Persona): Promise<Persona>;
    delete(id: string): Promise<void>;
}
