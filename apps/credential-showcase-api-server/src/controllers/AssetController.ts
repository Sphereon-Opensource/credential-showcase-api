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
import { Asset, NewAsset } from '../types';

@JsonController('/assets')
@Service()
class AssetController {
    constructor(private assetService: AssetService) { }

    @Get('/')
    public async getAll() {
        return this.assetService.getAssets()
    }

    @Get('/:id')
    getOne(@Param('id') id: string) {
        return this.assetService.getAsset(id);
    }

    @HttpCode(201)
    @Post('/')
    post(@Body() asset: NewAsset) {
        return this.assetService.createAsset(asset);
    }

    @Put('/:id')
    put(@Param('id') id: string, @Body() asset: Asset) {
        return this.assetService.updateAsset(id, asset)
    }

    @OnUndefined(204)
    @Delete('/:id')
    delete(@Param('id') id: string) {
        return this.assetService.deleteAsset(id);
    }
}

export default AssetController
