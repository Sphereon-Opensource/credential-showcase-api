import { eq } from 'drizzle-orm'

import { Persona, NewPersona, PersonaRepositoryDefinition } from '../../types'
import { assets, personas } from '../schema'
import { DatabaseService } from '../../services/DatabaseService'

class PersonaRepository implements PersonaRepositoryDefinition {

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
      .delete(assets)
      .where(eq(assets.id, id))
  }

  async update(id: string, persona: Persona): Promise<Persona> {
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
