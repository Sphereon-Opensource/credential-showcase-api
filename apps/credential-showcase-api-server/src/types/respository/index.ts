import { Asset, NewAsset } from '../schema';

export type AssetRepositoryDefinition = {
    findById(assetId: string): Promise<Asset>;
    findAll(): Promise<Asset[]>;
    create(asset: NewAsset): Promise<Asset>;
    update(id: string, asset: Asset): Promise<Asset>;
    delete(assetId: string): Promise<void>;
}
