import { eq } from 'drizzle-orm'

import { Persona, NewPersona, RepositoryDefinition } from '../../types'
import { personas } from '../schema'
import { DatabaseService } from '../../services/DatabaseService'
import { Service } from 'typedi'

@Service()
class PersonaRepository implements RepositoryDefinition<Persona, NewPersona> {

  constructor(private readonly databaseService: DatabaseService) {}

  async create(persona: NewPersona): Promise<Persona> {
    const result = await (await this.databaseService.getConnection())
      .insert(personas)
      .values(persona)
      .returning();

    return result[0]
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    await (await this.databaseService.getConnection())
      .delete(personas)
      .where(eq(personas.id, id))
  }

  async update(id: string, persona: NewPersona): Promise<Persona> {
    await this.findById(id)
    const result = await (await this.databaseService.getConnection())
      .update(personas)
      .set(persona)
      .returning();

    return result[0]
  }

  async findById(id: string): Promise<Persona> {
    const result = await (await this.databaseService.getConnection())
      .select()
      .from(personas)
      .where(eq(personas.id, id));

    if (result.length === 0 && !result[0]) {
      return Promise.reject(Error(`No persona found for id: ${id}`))
    }

    return result[0]
  }

  async findAll(): Promise<Persona[]> {
    return (await this.databaseService.getConnection())
      .select()
      .from(personas);
  }
}

export default PersonaRepository
