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
import {
    AssetResponse,
    AssetResponseFromJSONTyped,
    AssetRequest,
    AssetsResponse,
    AssetsResponseFromJSONTyped
} from 'credential-showcase-openapi'
import AssetService from '../services/AssetService';
import { assetFrom, newAssetFrom } from '../utils/mappers';

@JsonController('/assets')
@Service()
class AssetController {
    constructor(private assetService: AssetService) { }

    @Get('/')
    public async getAll(): Promise<AssetsResponse> {
        const result = await this.assetService.getAssets()
        const assets = result.map(asset => assetFrom(asset))
        return AssetsResponseFromJSONTyped({ assets }, true)
    }

    @Get('/:id')
    public async getOne(@Param('id') id: string): Promise<AssetResponse> {
        const result = await this.assetService.getAsset(id);
        return AssetResponseFromJSONTyped({ asset: assetFrom(result) }, true)
    }

    @HttpCode(201)
    @Post('/')
    public async post(@Body() assetRequest: AssetRequest): Promise<AssetResponse> {
        const result = await this.assetService.createAsset(newAssetFrom(assetRequest));
        return AssetResponseFromJSONTyped({ asset: assetFrom(result) }, true)
    }

    @Put('/:id')
    public async put(@Param('id') id: string, @Body() assetRequest: AssetRequest): Promise<AssetResponse> {
        const result = await this.assetService.updateAsset(id, newAssetFrom(assetRequest))
        return AssetResponseFromJSONTyped({ asset: assetFrom(result) }, true)
    }

    @OnUndefined(204)
    @Delete('/:id')
    public async delete(@Param('id') id: string) {
        return this.assetService.deleteAsset(id);
    }
}

export default AssetController
