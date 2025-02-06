import { Service } from "typedi";
import { Asset, NewAsset } from '../types';
import AssetRepository from '../database/repositories/AssetRepository';

@Service()
class AssetService {
    constructor(private readonly assetRepository: AssetRepository) {}

    public getAssets = async (): Promise<Asset[]> => {
        return this.assetRepository.findAll()
        // console.log('Not yet implemented')
        // return []
    };

    public getAsset = async (assetId: string): Promise<Asset> => {
        console.log('Not yet implemented')
        return {
            assetId,
            mediaType: 'image/png',
            fileName: 'image.png',
            description: 'some image',
            data: Buffer.from('some binary data'),
        } as Asset
    };

    public createAsset = async (asset: NewAsset): Promise<Asset> => {
        console.log('Not yet implemented')
        return {
            assetId: '123',
            mediaType: asset.mediaType,
            fileName: asset.fileName,
            description: asset.description,
            data: Buffer.from('some binary data'), // TODO, how do we REST binary data
        } as Asset
    };

    public updateAsset = async (assetId: string, asset: Asset): Promise<Asset> => { // TODO use id and asset
        console.log('Not yet implemented')
        return asset
    };

    public deleteAsset = async (assetId: string): Promise<void> => {
        console.log('Asset deleted')
        console.log('Not yet implemented')
    };

}

export default AssetService
