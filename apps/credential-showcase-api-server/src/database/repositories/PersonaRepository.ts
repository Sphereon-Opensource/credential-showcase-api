import { eq } from 'drizzle-orm'
import { Service } from 'typedi'
import { DatabaseService } from '../../services/DatabaseService'
import { NotFoundError } from '../../errors/NotFoundError'
import { assets, personas } from '../schema'
import { Persona, NewPersona, RepositoryDefinition } from '../../types'
import AssetRepository from './AssetRepository'

@Service()
class PersonaRepository implements RepositoryDefinition<Persona, NewPersona> {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly assetRepository: AssetRepository,
  ) {}

  async create(newPersona: NewPersona): Promise<Persona> {
    if (newPersona.headshotImage) {
      const headshotImage = await this.assetRepository.findById(newPersona.headshotImage)
      if (!headshotImage) {
        throw new NotFoundError(`Headshot image not found for persona ${newPersona.id}`)
      }
    }

    if (newPersona.bodyImage) {
      const bodyImage = await this.assetRepository.findById(newPersona.bodyImage)
      if (!bodyImage) {
        throw new NotFoundError(`Body image not found for persona ${newPersona.id}`)
      }
    }
    
    return (await this.databaseService.getConnection()).transaction(async (tx): Promise<Persona> => {
      const [result] = await tx
        .insert(personas)
        .values(newPersona)
        .returning({
          id: personas.id,
        });

      const persona = await this.findById(result.id)

      return persona
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    await (await this.databaseService.getConnection()).delete(assets).where(eq(assets.id, id))
  }

  async update(id: string, body: NewPersona): Promise<Persona> {
    await this.findById(id)
    const [result] = await (await this.databaseService.getConnection()).update(personas).set(body).where(eq(personas.id, id)).returning({
      id: personas.id,
    })

    const persona = await this.findById(result.id)
    return persona
  }

  async findById(id: string): Promise<Persona> {
    const result = await (
      await this.databaseService.getConnection()
    ).query.personas.findFirst({
      where: eq(personas.id, id),
      with: {
        headshotImage: true,
        bodyImage: true,
      },
    })

    if (!result) {
      return Promise.reject(new NotFoundError(`No persona found for id: ${id}`))
    }

    return result
  }

  async findAll(): Promise<Persona[]> {
    return (await this.databaseService.getConnection()).query.personas.findMany({
      with: {
        headshotImage: true,
        bodyImage: true,
      },
    })
  }
}

export default PersonaRepository
