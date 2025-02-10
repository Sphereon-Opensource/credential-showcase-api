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
} from 'routing-controllers';
import { Service } from 'typedi';
import RelyingPartyService from '../services/RelyingPartyService';
import { RelyingParty, NewRelyingParty } from '../types';

@JsonController('/roles/relying-parties')
@Service()
class RelyingPartyController {
    constructor(private relyingPartyService: RelyingPartyService) { }

    @Get('/')
    public async getAll() {
        return this.relyingPartyService.getRelyingParties()
    }

    @Get('/:id')
    getOne(@Param('id') id: string) {
        return this.relyingPartyService.getRelyingParty(id);
    }

    @HttpCode(201)
    @Post('/')
    post(@Body() asset: NewRelyingParty) {
        return this.relyingPartyService.createRelyingParty(asset);
    }

    @Put('/:id')
    put(@Param('id') id: string, @Body() relyingParty: RelyingParty) {
        return this.relyingPartyService.updateRelyingParty(id, relyingParty)
    }

    @OnUndefined(204)
    @Delete('/:id')
    delete(@Param('id') id: string) {
        return this.relyingPartyService.deleteRelyingParty(id);
    }
}

export default RelyingPartyController
