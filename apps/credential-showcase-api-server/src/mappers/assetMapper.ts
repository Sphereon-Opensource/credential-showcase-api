import { AssetsRequest } from '../../../../packages/credential-showcase-openapi';
import { NewAsset } from '../types';

export const newAssetFrom = (asset: AssetsRequest): NewAsset => {
    return {
        ...asset,
        content: Buffer.from(asset.contents) // TODO content
    }
}
