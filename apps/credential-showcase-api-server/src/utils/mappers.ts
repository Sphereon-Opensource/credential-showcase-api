import { Asset as AssetDTO, AssetRequest } from 'credential-showcase-openapi';
import { Asset, NewAsset } from '../types';

export const newAssetFrom = (asset: AssetRequest): NewAsset => {
    return {
        ...asset,
        content: Buffer.from(asset.content)
    }
}

export const assetDTOFrom = (asset: Asset): AssetDTO => {
    const result = {
        ...asset,
        content: asset.content.toString()
    }

    return replaceNullWithUndefined(result)
}

export const replaceNullWithUndefined = (obj: any): any => {
    if (obj === null) {
        return undefined
    }

    if (typeof obj !== 'object' || obj instanceof Date) {
        return obj
    }

    if (Array.isArray(obj)) {
        return obj.map((value: any) => replaceNullWithUndefined(value))
    }

    const result: any = {}
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = replaceNullWithUndefined(obj[key])
        }
    }
    return result
}
