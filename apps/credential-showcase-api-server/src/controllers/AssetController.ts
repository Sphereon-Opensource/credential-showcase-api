import {
    Body,
    Delete,
    Get,
    HttpCode,
    JsonController,
    OnUndefined,
    Param,
    Post,
    Put
} from 'routing-controllers'
import { Service } from 'typedi'
import AssetService from '../services/AssetService';
import {
    Asset, //AssetResponse
    AssetFromJSONTyped,
    AssetsRequest,
    AssetsResponse,
    AssetsResponseFromJSONTyped
} from '../../../../packages/credential-showcase-openapi'
import {newAssetFrom} from '../mappers/assetMapper';

@JsonController('/assets')
@Service()
class AssetController {
    constructor(private assetService: AssetService) { }

    @Get('/')
    public async getAll(): Promise<AssetsResponse> {
        const result = await this.assetService.getAssets()
        return AssetsResponseFromJSONTyped({ assets: result }, true)
    }

    @Get('/:id')
    public async getOne(@Param('id') id: string): Promise<Asset> {
        const result = await this.assetService.getAsset(id);
        return AssetFromJSONTyped(result, true)
    }

    @HttpCode(201)
    @Post('/')
    public async post(@Body() assetRequest: AssetsRequest): Promise<Asset> {
        const newAsset = newAssetFrom(assetRequest)
        const result = await this.assetService.createAsset(newAsset);
        return AssetFromJSONTyped(result, true)
    }

    @Put('/:id')
    public async put(@Param('id') id: string, @Body() assetRequest: AssetsRequest): Promise<Asset> {
        const newAsset = newAssetFrom(assetRequest)
        const result = await this.assetService.updateAsset(id, newAsset)
        return AssetFromJSONTyped(result, true)
    }

    @OnUndefined(204)
    @Delete('/:id')
    public async delete(@Param('id') id: string) {
        return this.assetService.deleteAsset(id);
    }
}

export default AssetController
