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
import CredentialDefinitionService from '../services/CredentialDefinitionService';
import { CredentialDefinition, NewCredentialDefinition } from '../types';

@JsonController('/credential-definitions')
@Service()
class CredentialDefinitionController {
    constructor(private credentialDefinitionService: CredentialDefinitionService) { }

    @Get('/')
    public async getAll() {
        return this.credentialDefinitionService.getCredentialDefinitions()
    }

    @Get('/:id')
    getOne(@Param('id') id: string) {
        return this.credentialDefinitionService.getCredentialDefinition(id);
    }

    @HttpCode(201)
    @Post('/')
    post(@Body() credentialDefinition: NewCredentialDefinition) {
        return this.credentialDefinitionService.createCredentialDefinition(credentialDefinition);
    }

    @Put('/:id')
    put(@Param('id') id: string, @Body() credentialDefinition: CredentialDefinition) {
        return this.credentialDefinitionService.updateCredentialDefinition(id, credentialDefinition)
    }

    @OnUndefined(204)
    @Delete('/:id')
    delete(@Param('id') id: string) {
        return this.credentialDefinitionService.deleteCredentialDefinition(id);
    }
}

export default CredentialDefinitionController
