import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Persona, NewPersona, PersonaRepositoryArgs, PersonaRepositoryDefinition } from '../../types'
import { personas } from '../schema'

class PersonaRepository implements PersonaRepositoryDefinition {
  private database: NodePgDatabase

  constructor(args: PersonaRepositoryArgs) {
    const { database } = args
    this.database = database
  }

  async create(persona: NewPersona): Promise<Persona> {
    const result = await this.database.insert(personas).values(persona).returning()
    return result[0]
  }

  async delete(personaId: string): Promise<boolean> {
    return this.database
      .delete(personas)
      .where(eq(personas.personaId, personaId))
      .then(() => true)
  }

  async update(persona: Persona): Promise<Persona> {
    const result = await this.database.update(personas).set(persona).returning()
    return result[0]
  }

  async findById(personaId: string): Promise<Persona | null> {
    const result = await this.database.select().from(personas).where(eq(personas.personaId, personaId))
    return result.length > 0 ? result[0] : null
  }

  async findAll(): Promise<Persona[]> {
    return this.database.select().from(personas)
  }
}

export default PersonaRepository
