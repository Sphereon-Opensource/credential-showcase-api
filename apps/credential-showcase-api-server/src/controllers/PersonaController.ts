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
    PersonasResponse,
    PersonasResponseFromJSONTyped,
    PersonaRequest
} from 'credential-showcase-openapi'
import PersonaService from '../services/PersonaService';

@JsonController('/personas')
@Service()
class PersonaController {
    constructor(private personaService: PersonaService) { }

    @Get('/')
    public async getAll(): Promise<PersonasResponse> {
        const result = await this.personaService.getPersonas()
        return PersonasResponseFromJSONTyped({ personas: result }, true)
    }

    @Get('/:id')
    public async getOne(@Param('id') id: string): Promise<PersonasResponse> {
        const result = await this.personaService.get(id);
        return PersonasResponseFromJSONTyped({ persona: result }, true)
    }

    @HttpCode(201)
    @Post('/')
    public async post(@Body() personaRequest: PersonaRequest): Promise<PersonasResponse> {
        const result = await this.personaService.create(personaRequest);
        return PersonasResponseFromJSONTyped({ persona: result }, true)
    }

    @Put('/:id')
    public async put(@Param('id') id: string, @Body() personaRequest: PersonaRequest): Promise<PersonasResponse> {
        const result = await this.personaService.update(id, personaRequest)
        return PersonasResponseFromJSONTyped({ persona: result }, true)
    }

    @OnUndefined(204)
    @Delete('/:id')
    public async delete(@Param('id') id: string) {
        return this.personaService.delete(id);
    }
}

export default PersonaController
