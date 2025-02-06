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
import { NewPersona, Persona } from '../types'
import PersonaService from '../services/PersonaService'

@JsonController('/personas')
@Service()
class PersonaController {
  constructor(private personaService: PersonaService) { }

  @Get('/')
  public async getAll() {
    return this.personaService.getPersonas()
  }

  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.personaService.getPersona(id)

    // TODO 404
  }

  @HttpCode(201)
  @Post('/')
  post(@Body() persona: NewPersona) {
    return this.personaService.createPersona(persona);
  }

  @Put('/:id')
  put(@Param('id') id: string, @Body() persona: Persona) {
    return this.personaService.updatePersona(id, persona)
  }

  @OnUndefined(204)
  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.personaService.deletePersona(id);
  }
}

export default PersonaController
