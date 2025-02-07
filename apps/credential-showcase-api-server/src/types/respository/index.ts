import { Asset, NewAsset } from '../schema';

export type AssetRepositoryDefinition = {
    findById(id: string): Promise<Asset>;
    findAll(): Promise<Asset[]>;
    create(asset: NewAsset): Promise<Asset>;
    update(id: string, asset: Asset): Promise<Asset>;
    delete(id: string): Promise<void>;
}
