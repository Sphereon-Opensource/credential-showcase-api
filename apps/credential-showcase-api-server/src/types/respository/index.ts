import { Asset, NewAsset, Issuer, NewIssuer } from '../schema';

export type AssetRepositoryDefinition = {
    findById(id: string): Promise<Asset>;
    findAll(): Promise<Asset[]>;
    create(asset: NewAsset): Promise<Asset>;
    update(id: string, asset: Asset): Promise<Asset>;
    delete(id: string): Promise<void>;
}

export type IssuerRepositoryDefinition = {
    findById(id: string): Promise<Issuer>;
    findAll(): Promise<Issuer[]>;
    create(issuer: NewIssuer): Promise<Issuer>;
    update(id: string, issuer: Issuer): Promise<Issuer>;
    delete(id: string): Promise<void>;
}
