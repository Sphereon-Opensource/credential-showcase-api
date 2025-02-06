import { Service } from 'typedi';
import { NewPersona, Persona } from '../types'
import PersonaRepository from '../database/repositories/PersonaRepository';

@Service()
class PersonaService {
  constructor(private readonly personaRepository: PersonaRepository) {}

  public getPersonas = async (): Promise<Persona[]> => {
    return this.personaRepository.findAll()
  };

  public getPersona = async (id: string): Promise<Persona | null> => {
    return this.personaRepository.findById(id)
  };

  public createPersona = async (persona: NewPersona): Promise<Persona> => {
    return this.personaRepository.create(persona)
  };

  public updatePersona = async (id: string, persona: Persona): Promise<Persona> => {
    return this.personaRepository.update(id, persona)
  };

  public deletePersona = async (id: string): Promise<void> => {
    return this.personaRepository.delete(id)
  };
}

export default PersonaService
