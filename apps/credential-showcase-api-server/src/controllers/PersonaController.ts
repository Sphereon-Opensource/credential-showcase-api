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
import { NewPersona } from '../types'
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
  public async getOne(@Param('id') id: string) {
    return this.personaService.getPersona(id)
  }

  @HttpCode(201)
  @Post('/')
  public async post(@Body() persona: NewPersona) {
    return this.personaService.createPersona(persona);
  }

  @Put('/:id')
  public async put(@Param('id') id: string, @Body() persona: NewPersona) {
    return this.personaService.updatePersona(id, persona)
  }

  @OnUndefined(204)
  @Delete('/:id')
  public async delete(@Param('id') id: string) {
    return this.personaService.deletePersona(id);
  }
}

export default PersonaController
