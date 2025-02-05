import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Asset, NewAsset } from '../schema';

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
